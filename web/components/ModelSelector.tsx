'use client';

import { useState } from 'react';

interface ModelSelectorProps {
    hasCustomApiConfig: boolean;
    customApiBaseUrl: string | null;
    customApiKey: string | null;
    selectedModel: string;
    isAnalysisLoading: boolean;
    onModelChange: (model: string) => void;
    onReinterpret: (model: string) => Promise<boolean>;
}

const ReinterpretIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 21h5v-5" />
    </svg>
);

const StartIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M5 12h14" />
        <path d="M12 5l7 7-7 7" />
    </svg>
);

export default function ModelSelector({
    hasCustomApiConfig,
    customApiBaseUrl,
    customApiKey,
    selectedModel,
    isAnalysisLoading,
    onModelChange,
    onReinterpret,
}: ModelSelectorProps) {
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [isFetchingModels, setIsFetchingModels] = useState(false);
    const [modelMessage, setModelMessage] = useState('');

    const handleFetchModels = async () => {
        if (!hasCustomApiConfig || !customApiBaseUrl || !customApiKey) {
            setModelMessage('请先在设置页面配置API');
            return;
        }

        setIsFetchingModels(true);
        setModelMessage(availableModels.length > 0 ? '正在刷新模型列表...' : '正在获取模型列表...');

        try {
            const normalizedBaseUrl = customApiBaseUrl.replace(/\/+$/, '');
            const response = await fetch(`${normalizedBaseUrl}/models`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${customApiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const payload = (await response.json()) as {
                    data?: Array<{ id?: string | null; name?: string | null }>;
                };

                const modelIds = Array.isArray(payload.data)
                    ? payload.data
                          .map((item) => item?.id ?? item?.name ?? '')
                          .filter(
                              (value): value is string =>
                                  typeof value === 'string' && value.trim().length > 0
                          )
                    : [];

                const uniqueModels = Array.from(new Set(modelIds)).sort((a, b) =>
                    a.localeCompare(b)
                );

                if (uniqueModels.length > 0) {
                    setAvailableModels(uniqueModels);
                    const trimmedPrev = selectedModel.trim();
                    if (!trimmedPrev || !uniqueModels.includes(trimmedPrev)) {
                        onModelChange(uniqueModels[0] ?? '');
                    }
                    setModelMessage(`✅ 成功获取 ${uniqueModels.length} 个可用模型`);
                } else {
                    setAvailableModels([]);
                    onModelChange('');
                    setModelMessage('[!] 未找到可用模型');
                }
            } else {
                setAvailableModels([]);
                onModelChange('');
                setModelMessage('❌ 获取模型列表失败，请检查配置');
            }
        } catch (error) {
            console.error('获取模型列表失败:', error);
            setAvailableModels([]);
            onModelChange('');
            setModelMessage('❌ 获取模型列表失败，请检查网络和配置');
        } finally {
            setIsFetchingModels(false);
        }
    };

    const handleReinterpret = async () => {
        if (isAnalysisLoading) return;

        if (!hasCustomApiConfig || !customApiBaseUrl || !customApiKey) {
            setModelMessage('请先在设置页面配置API');
            return;
        }

        const trimmedSelection = selectedModel.trim();
        if (!trimmedSelection) {
            setModelMessage('请先选择一个模型');
            return;
        }

        setModelMessage(`🔁 正在使用 ${trimmedSelection} 重新解读...`);

        const success = await onReinterpret(trimmedSelection);

        if (success) {
            setModelMessage(`✅ 已使用 ${trimmedSelection} 完成重新解读`);
        } else {
            setModelMessage('❌ 重新解读失败，请检查模型配置或稍后重试');
        }
    };

    if (!hasCustomApiConfig) return null;

    return (
        <div className="mt-8 rounded-sm border border-border bg-card-bg p-6">
            <div className="mb-4 flex items-center gap-3 text-text-sub">
                <ReinterpretIcon />
                <div>
                    <h3 className="text-sm font-bold text-text-main">重新解读</h3>
                    <p className="text-xs text-text-muted">尝试使用其他模型获取不同的视角</p>
                </div>
            </div>

            {modelMessage && (
                <div
                    className={`mb-4 rounded-sm border p-3 text-xs font-medium ${
                        modelMessage.includes('成功') || modelMessage.includes('✅')
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-400'
                            : modelMessage.includes('❌') || modelMessage.includes('失败')
                              ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400'
                              : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/30 dark:bg-sky-900/10 dark:text-sky-400'
                    }`}
                >
                    {modelMessage}
                </div>
            )}

            <div className="space-y-4">
                <button
                    onClick={handleFetchModels}
                    disabled={isFetchingModels || isAnalysisLoading}
                    className="w-full rounded-sm border border-border bg-bg-main px-4 py-3 text-sm font-medium text-text-sub hover:bg-bg-main/80 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isFetchingModels
                        ? '获取中...'
                        : availableModels.length > 0
                          ? '🔁 刷新模型列表'
                          : '📋 获取模型列表'}
                </button>

                {availableModels.length > 0 && (
                    <div className="space-y-4 animate-fade-in">
                        <div>
                            <select
                                id="modelSelect"
                                value={selectedModel}
                                onChange={(e) => onModelChange(e.target.value)}
                                disabled={isAnalysisLoading}
                                className="w-full rounded-sm bg-bg-main border border-border px-4 py-3 text-sm text-text-main focus:border-accent-main focus:outline-none focus:ring-1 focus:ring-accent-main/50 appearance-none cursor-pointer"
                            >
                                <option value="">请选择模型</option>
                                {availableModels.map((modelId) => (
                                    <option key={modelId} value={modelId}>
                                        {modelId}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleReinterpret}
                                disabled={!selectedModel || isAnalysisLoading}
                                className="flex-1 btn-seal text-sm py-3"
                            >
                                {isAnalysisLoading ? (
                                    '解读中...'
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <StartIcon /> 开始解读
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setAvailableModels([]);
                                    setModelMessage('');
                                }}
                                disabled={isAnalysisLoading}
                                className="rounded-sm border border-border bg-bg-main px-4 py-3 text-sm font-medium text-text-muted hover:text-text-main transition-all disabled:opacity-50"
                            >
                                隐藏
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
