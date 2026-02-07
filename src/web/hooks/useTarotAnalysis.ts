'use client';

import { useState, useRef, useCallback } from 'react';
import { apiRequest, assertOk } from '@/utils/apiClient';
import { getDefaultLlmConfig, isDefaultLlmUsable } from '@/utils/llmConfig';
import { historyManager } from '@/utils/historyManager';
import { constructTarotPrompts } from '@/utils/prompts';
import { getSSEErrorMessage, parseSSEStream } from '@/utils/sseParser';
import { createStreamBatcher } from '@/utils/streamBatcher';
import type { DrawnCard, Spread, ChatMessage } from '@/types/tarot';

interface ApiConfigState {
    hasCustomApiConfig: boolean;
    customApiBaseUrl: string | null;
    customApiKey: string | null;
    selectedModel: string;
}

interface AnalysisState {
    analysis: string;
    isLoading: boolean;
    error: string;
    chatHistory: ChatMessage[];
}

export function useTarotAnalysis() {
    const [analysisState, setAnalysisState] = useState<AnalysisState>({
        analysis: '',
        isLoading: false,
        error: '',
        chatHistory: [],
    });

    const [apiConfig, setApiConfig] = useState<ApiConfigState>({
        hasCustomApiConfig: false,
        customApiBaseUrl: null,
        customApiKey: null,
        selectedModel: '',
    });

    const analysisContainerRef = useRef<HTMLDivElement>(null);

    const loadApiConfig = useCallback(() => {
        const localBaseUrl = localStorage.getItem('tarot_api_base_url')?.trim() || null;
        const localApiKey = localStorage.getItem('tarot_api_key')?.trim() || null;
        const localModel = localStorage.getItem('tarot_api_model')?.trim() || '';
        const hasLocalConfig = Boolean(localBaseUrl && localApiKey);

        setApiConfig({
            hasCustomApiConfig: hasLocalConfig,
            customApiBaseUrl: localBaseUrl,
            customApiKey: localApiKey,
            selectedModel: localModel,
        });

        return { localBaseUrl, localApiKey, localModel, hasLocalConfig };
    }, []);

    const setSelectedModel = useCallback((model: string) => {
        setApiConfig((prev) => ({ ...prev, selectedModel: model }));
    }, []);

    const performAnalysis = useCallback(
        async (
            question: string,
            spread: Spread,
            cards: DrawnCard[],
            overrideModel?: string
        ): Promise<boolean> => {
            setAnalysisState((prev) => ({
                ...prev,
                analysis: '',
                isLoading: true,
                error: '',
                chatHistory: [],
            }));

            let success = false;

            try {
                const localBaseUrl = localStorage.getItem('tarot_api_base_url')?.trim() || null;
                const localApiKey = localStorage.getItem('tarot_api_key')?.trim() || null;
                const localModel = localStorage.getItem('tarot_api_model')?.trim() || null;

                const hasLocalConfig = Boolean(localBaseUrl && localApiKey);
                const defaultConfig = getDefaultLlmConfig();
                const useDefaultConfig = !hasLocalConfig && isDefaultLlmUsable();

                setApiConfig((prev) => ({
                    ...prev,
                    hasCustomApiConfig: hasLocalConfig,
                    customApiBaseUrl: localBaseUrl,
                    customApiKey: localApiKey,
                }));

                const trimmedOverrideModel = overrideModel?.trim() || '';
                const overrideCandidate =
                    trimmedOverrideModel.length > 0 ? trimmedOverrideModel : null;

                if (!hasLocalConfig && !useDefaultConfig) {
                    setAnalysisState((prev) => ({
                        ...prev,
                        error: 'API 配置缺失，请前往设置页面配置',
                        isLoading: false,
                    }));
                    return false;
                }

                const effectiveModel =
                    overrideCandidate ??
                    (hasLocalConfig ? localModel : null) ??
                    (useDefaultConfig ? defaultConfig.model : null) ??
                    'Qwen/Qwen3-Next-80B-A3B-Instruct';

                if (hasLocalConfig && effectiveModel) {
                    localStorage.setItem('tarot_api_model', effectiveModel);
                }

                setApiConfig((prev) => ({ ...prev, selectedModel: effectiveModel }));

                const { systemPrompt, userPrompt } = constructTarotPrompts(
                    question,
                    spread.name,
                    spread.id,
                    cards
                );

                const response = await apiRequest('/api/v1/tarot/analyze', {
                    method: 'POST',
                    body: JSON.stringify({
                        question,
                        spreadName: spread.name,
                        spreadId: spread.id,
                        drawnCards: cards.map((c) => ({
                            card: {
                                id: String(c.card.id),
                                name: c.card.name,
                                englishName: c.card.englishName,
                            },
                            isReversed: c.isReversed,
                            position: c.position,
                        })),
                    }),
                });
                await assertOk(response, 'API 请求失败');

                const reader = response.body?.getReader();
                if (!reader) {
                    throw new Error('无法读取响应流');
                }

                let analysisText = '';

                // Use RAF batching for smooth updates
                const batcher = createStreamBatcher((text) => {
                    setAnalysisState((prev) => ({ ...prev, analysis: text }));
                });

                for await (const chunk of parseSSEStream(reader)) {
                    const streamError = getSSEErrorMessage(chunk);
                    if (streamError) {
                        throw new Error(streamError);
                    }
                    const content = chunk.choices?.[0]?.delta?.content || chunk.content;
                    if (content) {
                        analysisText += content;
                        batcher.update(analysisText);
                    }
                }

                // Ensure final state is set
                batcher.complete();

                const hasContent = analysisText.trim().length > 0;

                if (hasContent) {
                    success = true;
                    setAnalysisState((prev) => ({
                        ...prev,
                        chatHistory: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt },
                            { role: 'assistant', content: analysisText },
                        ],
                    }));

                    try {
                        historyManager.saveReading(
                            question,
                            spread.name,
                            spread.id,
                            cards,
                            analysisText
                        );
                    } catch (error) {
                        console.error('保存历史记录失败:', error);
                    }
                }
            } catch (error) {
                console.error('分析失败:', error);
                setAnalysisState((prev) => ({
                    ...prev,
                    error:
                        error instanceof DOMException && error.name === 'AbortError'
                            ? '请求超时，请稍后重试'
                            : error instanceof Error
                              ? error.message
                              : '分析过程中出现未知错误',
                }));
                success = false;
            } finally {
                setAnalysisState((prev) => ({ ...prev, isLoading: false }));
            }

            return success;
        },
        []
    );

    return {
        ...analysisState,
        ...apiConfig,
        analysisContainerRef,
        loadApiConfig,
        setSelectedModel,
        performAnalysis,
    };
}

export async function analyzeTarotReading(
    question: string,
    spread: Spread,
    cards: DrawnCard[],
    onStream?: (chunk: string) => void
): Promise<string> {
    const response = await apiRequest('/api/v1/tarot/analyze', {
        method: 'POST',
        body: JSON.stringify({
            question,
            spreadName: spread.name,
            spreadId: spread.id,
            drawnCards: cards.map((c) => ({
                card: {
                    id: String(c.card.id),
                    name: c.card.name,
                    englishName: c.card.englishName,
                },
                isReversed: c.isReversed,
                position: c.position,
            })),
        }),
    });
    await assertOk(response, 'API 请求失败');

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('无法读取响应流');
    }

    let analysisText = '';

    // Use RAF batching for smooth streaming updates
    const batcher = onStream ? createStreamBatcher(onStream) : null;

    for await (const chunk of parseSSEStream(reader)) {
        const streamError = getSSEErrorMessage(chunk);
        if (streamError) {
             throw new Error(streamError);
        }

        // Robustly handle both standard OpenAI and custom content fields
        const content = chunk.choices?.[0]?.delta?.content || chunk.content;
        if (content) {
            analysisText += content;
            if (batcher) {
                batcher.update(analysisText);
            }
        }
    }

    // Ensure final state is set
    if (batcher) {
        batcher.complete();
    }

    return analysisText;
}
