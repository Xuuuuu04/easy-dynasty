'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { preprocessMarkdown } from '@/utils/markdown'
import { historyManager } from '@/utils/historyManager'
import TarotChat from '@/components/TarotChat'
import { constructTarotPrompts } from '@/utils/prompts'
import { getDefaultLlmConfig, isDefaultLlmUsable } from '@/utils/llmConfig'
import type { ReadingHistory, ChatMessage } from '@/types/tarot'
import { HistoryIcon, TarotIcon, BaziIcon, CloseIcon } from '@/components/Icons'
import BaziChartDisplay from '@/components/BaziChart'

export default function HistoryDetailPage() {
    const router = useRouter()
    const params = useParams()
    const [reading, setReading] = useState<ReadingHistory | null>(null)
    const [loading, setLoading] = useState(true)
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
    const [apiConfig, setApiConfig] = useState<{baseUrl: string | null, apiKey: string | null, model: string}>({ baseUrl: null, apiKey: null, model: '' })

    useEffect(() => {
        const loadDetail = async () => {
            if (params.id && typeof params.id === 'string') {
                const token = localStorage.getItem('token');
                let foundReading: any = null;
                
                if (token && !params.id.startsWith('local_')) {
                    // Try fetch directly from cloud
                    foundReading = await historyManager.fetchCloudReadingById(params.id);
                }
                
                // Fallback to local
                if (!foundReading) {
                    foundReading = historyManager.getLocalHistory().find(h => h.id === params.id);
                }

                setReading(foundReading)
                
                if (foundReading) {
                   // Construct Chat History
                   const { systemPrompt, userPrompt } = constructTarotPrompts(
                      foundReading.question,
                      foundReading.spreadName || '',
                      foundReading.spreadId || '',
                      foundReading.drawnCards || []
                   )
                   setChatHistory([
                      { role: 'system', content: systemPrompt },
                      { role: 'user', content: userPrompt },
                      { role: 'assistant', content: foundReading.analysis }
                   ])

                   // Load API Config
                   const localBaseUrl = localStorage.getItem('tarot_api_base_url')?.trim() || null
                   const localApiKey = localStorage.getItem('tarot_api_key')?.trim() || null
                   const localModel = localStorage.getItem('tarot_api_model')?.trim() || ''
                   
                   const hasLocalConfig = Boolean(localBaseUrl && localApiKey)
                   const defaultConfig = getDefaultLlmConfig()
                   const useDefaultConfig = !hasLocalConfig && isDefaultLlmUsable()

                   const effectiveModel =
                     (hasLocalConfig ? localModel : null) ??
                     (useDefaultConfig ? defaultConfig.model : null) ??
                     'gpt-4o-mini'
                   
                   setApiConfig({
                      baseUrl: localBaseUrl,
                      apiKey: localApiKey,
                      model: effectiveModel
                   })
                }
                setLoading(false)
            }
        };
        loadDetail();
    }, [params.id])

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp)
        if (Number.isNaN(date.getTime())) return '未知时间'
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        }).format(date)
    }

    const handleDelete = async () => {
        if (!reading) return
        if (!confirm('确定要删除这条记录吗？')) return

        try {
            const token = localStorage.getItem('token');
            if (token && !reading.id.startsWith('local_')) {
                await historyManager.deleteCloudReading(reading.id);
            } else {
                historyManager.deleteReading(reading.id);
            }
            router.push('/history')
        } catch (error) {
            alert('删除失败');
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center font-serif">
            <div className="text-stone-400 animate-pulse tracking-widest">正在调取卷宗...</div>
        </div>
    )

    if (!reading) return (
        <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center gap-6 font-serif">
            <div className="text-2xl text-stone-400">卷宗已佚失</div>
            <button onClick={() => router.push('/history')} className="btn-seal px-6 py-2">返回列表</button>
        </div>
    )

    return (
        <div className="relative min-h-screen pt-24 pb-12 px-4 overflow-hidden bg-[#f5f5f0] text-stone-800 font-serif">
            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-8 flex items-center justify-between animate-slide-up">
                    <button onClick={() => router.push('/history')} className="text-stone-500 hover:text-ink transition-colors flex items-center gap-2 text-sm">
                        <span>←</span> 返回列表
                    </button>
                    <button onClick={handleDelete} className="text-red-700/60 hover:text-red-700 transition-colors text-sm flex items-center gap-2">
                        <CloseIcon className="w-4 h-4" />
                        <span>删除卷宗</span>
                    </button>
                </div>

                <div className="ink-card p-6 md:p-12 animate-slide-up">
                    <div className="border-b border-stone-200 pb-8 mb-8">
                        <div className="text-[#9a2b2b] text-xs font-bold tracking-widest mb-4 uppercase">
                            {formatTimestamp(reading.timestamp)}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-ink mb-4 leading-tight">
                            {reading.question}
                        </h1>
                        <div className="flex items-center gap-2 text-stone-400 text-sm italic">
                            {reading.type === 'bazi' ? <BaziIcon className="w-4 h-4" /> : <TarotIcon className="w-4 h-4" />}
                            <span>{reading.spreadName || (reading.type === 'bazi' ? '八字排盘' : '自由解读')}</span>
                        </div>
                    </div>

                    {reading.type === 'bazi' && reading.chart && (
                        <div className="mb-12 overflow-x-auto">
                            <BaziChartDisplay result={reading as any} />
                        </div>
                    )}

                    <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-ink prose-p:leading-relaxed text-stone-700">
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                                table: ({ children }) => <div className="overflow-x-auto my-6 border border-stone-200 rounded-sm"><table className="min-w-full divide-y divide-stone-200 text-xs md:text-sm">{children}</table></div>,
                                thead: ({ children }) => <thead className="bg-stone-50">{children}</thead>,
                                tbody: ({ children }) => <tbody className="divide-y divide-stone-100 bg-white">{children}</tbody>,
                                tr: ({ children }) => <tr className="divide-x divide-stone-100">{children}</tr>,
                                th: ({ children }) => <th className="px-3 py-2 text-left font-bold text-stone-500 border-r border-stone-200 last:border-r-0">{children}</th>,
                                td: ({ children }) => <td className="px-3 py-2 border-r border-stone-100 last:border-r-0">{children}</td>,
                            }}
                        >
                            {preprocessMarkdown(reading.analysis)}
                        </ReactMarkdown>
                    </div>

                    <div className="mt-12 pt-12 border-t border-stone-100">
                        <TarotChat initialHistory={chatHistory} apiConfig={apiConfig} />
                    </div>
                </div>
            </div>
        </div>
    )
}