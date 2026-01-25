'use client';

import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { preprocessMarkdown } from '@/utils/markdown';
import { parseSSEStream } from '@/utils/sseParser';
import type { ChatMessage, ApiConfig } from '@/types/tarot';

// Helper to batch rapid updates using RAF
function createStreamBatcher(updateFn: (text: string) => void) {
    let pendingText = '';
    let rafId: number | null = null;
    let isComplete = false;

    const flush = () => {
        if (pendingText) {
            updateFn(pendingText);
        }
        rafId = null;
    };

    const update = (text: string) => {
        pendingText = text;
        if (!rafId && !isComplete) {
            rafId = requestAnimationFrame(flush);
        }
    };

    const complete = () => {
        isComplete = true;
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        flush();
    };

    return { update, complete };
}

interface TarotChatProps {
    initialHistory: ChatMessage[];
    apiConfig: ApiConfig;
    endpoint?: string;
    title?: string;
}

const ChatIcon = () => (
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
        className="text-accent-main"
    >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

export default function TarotChat({
    initialHistory,
    apiConfig,
    endpoint = '/api/v1/tarot/chat',
    title = '塔罗师对话',
}: TarotChatProps) {
    const [history, setHistory] = useState<ChatMessage[]>(initialHistory);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialHistory.length > 0) {
            setHistory(initialHistory);
        }
    }, [initialHistory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: ChatMessage = { role: 'user', content: input.trim() };
        const newHistory = [...history, userMsg];
        setHistory(newHistory);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || ''}${endpoint}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ messages: newHistory }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `API 错误: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader');

            let assistantMsgContent = '';

            setHistory((prev) => [...prev, { role: 'assistant', content: '' }]);

            // Use RAF batching for smooth updates
            const batcher = createStreamBatcher((text) => {
                setHistory((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'assistant', content: text };
                    return updated;
                });
            });

            for await (const chunk of parseSSEStream(reader)) {
                const content = chunk.choices?.[0]?.delta?.content || chunk.content;
                if (content) {
                    assistantMsgContent += content;
                    batcher.update(assistantMsgContent);
                }
            }

            // Ensure final state is set
            batcher.complete();
        } catch (error) {
            console.error('Chat error:', error);
            setHistory((prev) => [
                ...prev,
                { role: 'assistant', content: '[!] 连接断开，请重试。' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Only show follow-up messages (skip system, initial user, initial analysis)
    const followUpMessages = history.slice(3);

    return (
        <div className="mt-8 border-t border-border pt-8 animate-fade-in text-left">
            <h3 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                <ChatIcon /> {title}
            </h3>

            <div className="space-y-4 mb-6 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-1">
                {followUpMessages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[90%] md:max-w-[85%] rounded-xl px-3 py-2 md:px-4 md:py-3 shadow-sm ${msg.role === 'user'
                                    ? 'bg-accent-main text-white rounded-br-none'
                                    : 'bg-card-bg border border-border text-text-main rounded-bl-none'
                                }`}
                        >
                            <div
                                className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'dark:prose-invert prose-stone'} text-xs md:text-sm`}
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h1: ({ children }) => (
                                            <h1 className="text-xl font-bold border-b border-current pb-1 mb-4">
                                                {children}
                                            </h1>
                                        ),
                                        h2: ({ children }) => (
                                            <h2 className="text-lg font-bold mt-6 mb-3">
                                                {children}
                                            </h2>
                                        ),
                                        h3: ({ children }) => (
                                            <h3 className="text-base font-bold mt-4 mb-2">
                                                {children}
                                            </h3>
                                        ),
                                        p: ({ children }) => (
                                            <p className="mb-3 leading-relaxed">{children}</p>
                                        ),
                                        blockquote: ({ children }) => (
                                            <blockquote className="border-l-4 border-accent-main bg-bg-main/50 py-2 pl-4 italic my-4 rounded-r">
                                                {children}
                                            </blockquote>
                                        ),
                                        table: ({ children }) => (
                                            <div className="overflow-x-auto my-4 border border-border rounded-sm shadow-sm">
                                                <table className="min-w-full divide-y divide-border">
                                                    {children}
                                                </table>
                                            </div>
                                        ),
                                        thead: ({ children }) => (
                                            <thead className="bg-bg-main">{children}</thead>
                                        ),
                                        th: ({ children }) => (
                                            <th className="px-3 py-2 text-left text-xs font-bold text-text-muted uppercase border-r border-border last:border-r-0">
                                                {children}
                                            </th>
                                        ),
                                        td: ({ children }) => (
                                            <td className="px-3 py-2 text-xs text-text-sub border-r border-border last:border-r-0">
                                                {children}
                                            </td>
                                        ),
                                        tr: ({ children }) => (
                                            <tr className="divide-x divide-border even:bg-bg-main/50">
                                                {children}
                                            </tr>
                                        ),
                                    }}
                                >
                                    {preprocessMarkdown(msg.content || '...')}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading &&
                    (followUpMessages.length === 0 ||
                        followUpMessages[followUpMessages.length - 1]?.content !== '') && (
                        <div className="flex justify-start">
                            <div className="bg-card-bg border border-border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                <div className="flex gap-1">
                                    <div
                                        className="w-2 h-2 bg-text-muted rounded-full animate-bounce"
                                        style={{ animationDelay: '0s' }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 bg-text-muted rounded-full animate-bounce"
                                        style={{ animationDelay: '0.2s' }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 bg-text-muted rounded-full animate-bounce"
                                        style={{ animationDelay: '0.4s' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="对此次解读还有疑问？请继续提问..."
                    className="w-full rounded-sm bg-card-bg border border-border px-4 py-3 pr-12 text-text-main placeholder:text-text-muted focus:border-accent-main focus:outline-none focus:ring-1 focus:ring-accent-main/50 transition-all font-serif"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-accent-main disabled:opacity-50 transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                    >
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                </button>
            </form>
        </div>
    );
}
