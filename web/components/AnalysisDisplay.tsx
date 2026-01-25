'use client';

import { RefObject, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { preprocessMarkdown } from '@/utils/markdown';
import TarotChat from './TarotChat';
import ModelSelector from './ModelSelector';
import type { ChatMessage, ApiConfig } from '@/types/tarot';

interface AnalysisDisplayProps {
    analysis: string;
    isLoading: boolean;
    error: string;
    chatHistory: ChatMessage[];
    hasCustomApiConfig: boolean;
    customApiBaseUrl: string | null;
    customApiKey: string | null;
    selectedModel: string;
    analysisContainerRef: RefObject<HTMLDivElement | null>;
    onModelChange: (model: string) => void;
    onReinterpret: (model: string) => Promise<boolean>;
}

// Custom Icons
const AnalysisIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[var(--accent-main)]"
    >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

export default function AnalysisDisplay({
    analysis,
    isLoading,
    error,
    chatHistory,
    hasCustomApiConfig,
    customApiBaseUrl,
    customApiKey,
    selectedModel,
    analysisContainerRef,
    onModelChange,
    onReinterpret,
}: AnalysisDisplayProps) {
    const router = useRouter();

    const apiConfig: ApiConfig = {
        baseUrl: customApiBaseUrl,
        apiKey: customApiKey,
        model: selectedModel,
    };

    // Memoize preprocessed markdown to avoid recalculating on every render
    const processedAnalysis = useMemo(() => {
        return analysis ? preprocessMarkdown(analysis) : '';
    }, [analysis]);

    return (
        <div
            className="ink-card p-6 md:p-8 flex flex-col animate-slide-up bg-[#fffdf9]/85 dark:bg-slate-900/60 backdrop-blur-xl border-stone-300/60 dark:border-slate-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            style={{ animationDelay: '0.2s' }}
        >
            <h2 className="text-xl font-bold text-center text-[var(--text-main)] mb-6 font-display flex items-center justify-center gap-2">
                <AnalysisIcon /> 塔罗解读
            </h2>

            <div
                ref={analysisContainerRef}
                className="flex-1 max-h-[calc(100vh-250px)] overflow-y-auto scroll-smooth pr-2 custom-scrollbar"
            >
                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
                        <div className="mb-2 text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                            <span>❌</span> 分析失败
                        </div>
                        <div className="text-sm text-red-700 dark:text-red-300 mb-4">{error}</div>
                        <button
                            onClick={() => router.push('/settings')}
                            className="inline-flex rounded-full bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 px-4 py-2 text-sm font-medium text-red-800 dark:text-red-200 transition-all"
                        >
                            检查设置
                        </button>
                    </div>
                )}

                {isLoading && !analysis && (
                    <div className="py-20 text-center">
                        <div className="relative mx-auto mb-8 h-20 w-20">
                            <div className="absolute inset-0 rounded-full border-4 border-stone-200 dark:border-slate-700"></div>
                            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[var(--accent-main)] border-r-stone-400 dark:border-r-slate-500"></div>
                        </div>
                        <div className="mb-3 text-lg font-bold text-[var(--text-main)] animate-pulse">
                            塔罗大师正在为您解读...
                        </div>
                        <div className="text-sm text-stone-500 dark:text-stone-400">
                            这可能需要几十秒时间，请耐心等待星辰的指引
                        </div>
                    </div>
                )}

                {analysis && (
                    <div className="prose prose-stone dark:prose-invert max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({ children }) => (
                                    <h1 className="mb-6 text-2xl font-bold font-display text-[var(--text-main)] border-b-2 border-[var(--accent-main)] pb-2 inline-block">
                                        {children}
                                    </h1>
                                ),
                                h2: ({ children }) => (
                                    <h2 className="mb-4 mt-8 text-xl font-bold text-[var(--text-main)] border-b border-stone-300 dark:border-stone-700 pb-2">
                                        {children}
                                    </h2>
                                ),
                                h3: ({ children }) => (
                                    <h3 className="mb-3 mt-6 text-lg font-bold text-[var(--accent-main)]">
                                        {children}
                                    </h3>
                                ),
                                p: ({ children }) => (
                                    <p className="mb-4 leading-relaxed text-stone-700 dark:text-stone-300">
                                        {children}
                                    </p>
                                ),
                                strong: ({ children }) => (
                                    <strong className="font-bold text-[var(--text-main)]">{children}</strong>
                                ),
                                em: ({ children }) => (
                                    <em className="text-[var(--accent-main)] not-italic font-medium">
                                        {children}
                                    </em>
                                ),
                                ul: ({ children }) => (
                                    <ul className="mb-4 space-y-2 pl-6 text-stone-700 dark:text-stone-300 list-disc marker:text-[var(--accent-main)]">
                                        {children}
                                    </ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="mb-4 space-y-2 pl-6 text-stone-700 dark:text-stone-300 list-decimal marker:text-[var(--accent-main)]">
                                        {children}
                                    </ol>
                                ),
                                li: ({ children }) => <li className="pl-1">{children}</li>,
                                blockquote: ({ children }) => (
                                    <blockquote className="my-6 border-l-4 border-[var(--accent-main)] bg-stone-100/50 dark:bg-slate-800/50 py-4 pl-6 italic text-stone-600 dark:text-stone-400 rounded-r-lg">
                                        {children}
                                    </blockquote>
                                ),
                                table: ({ children }) => (
                                    <div className="overflow-x-auto my-8 border border-stone-200 dark:border-stone-700 rounded-sm shadow-sm">
                                        <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-700">
                                            {children}
                                        </table>
                                    </div>
                                ),
                                thead: ({ children }) => (
                                    <thead className="bg-stone-50 dark:bg-slate-800">{children}</thead>
                                ),
                                th: ({ children }) => (
                                    <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider border-r border-stone-200 dark:border-stone-700 last:border-r-0">
                                        {children}
                                    </th>
                                ),
                                td: ({ children }) => (
                                    <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-300 border-r border-stone-100 dark:border-stone-800 last:border-r-0">
                                        {children}
                                    </td>
                                ),
                                tr: ({ children }) => (
                                    <tr className="divide-x divide-stone-100 dark:divide-stone-800 even:bg-stone-50/50 dark:even:bg-slate-800/30">
                                        {children}
                                    </tr>
                                ),
                            }}
                        >
                            {processedAnalysis}
                        </ReactMarkdown>
                    </div>
                )}

                {!isLoading && !error && !analysis && (
                    <div className="py-20 text-center text-stone-500 dark:text-stone-400">等待分析开始...</div>
                )}

                {/* Chat Section */}
                {analysis && <TarotChat initialHistory={chatHistory} apiConfig={apiConfig} />}

                {/* Reinterpret Section */}
                {analysis && (
                    <ModelSelector
                        hasCustomApiConfig={hasCustomApiConfig}
                        customApiBaseUrl={customApiBaseUrl}
                        customApiKey={customApiKey}
                        selectedModel={selectedModel}
                        isAnalysisLoading={isLoading}
                        onModelChange={onModelChange}
                        onReinterpret={onReinterpret}
                    />
                )}
            </div>
        </div>
    );
}
