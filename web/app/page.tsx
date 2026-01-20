'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import spreadsData from '../data/spreads.json'
import { isDefaultLlmUsable } from '@/utils/llmConfig'
import { useToast } from '@/components/Toast'
import type { Spread } from '@/types/tarot'

export default function Home() {
  const [question, setQuestion] = useState('')
  const [selectedSpread, setSelectedSpread] = useState<string>('')
  const [showApiWarning, setShowApiWarning] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()
  const defaultLlmUsable = isDefaultLlmUsable()

  useEffect(() => {
    const checkApiConfig = () => {
      const apiKey = localStorage.getItem('tarot_api_key')
      const baseUrl = localStorage.getItem('tarot_api_base_url')
      const hasLocalConfig = Boolean(apiKey && baseUrl)

      setShowApiWarning(!hasLocalConfig && !defaultLlmUsable)
    }

    checkApiConfig()
  }, [defaultLlmUsable])

  const handleStartReading = () => {
    if (!question.trim()) {
      showToast('请输入您的问题', 'warning')
      return
    }

    if (!selectedSpread) {
      showToast('请选择一个牌阵', 'warning')
      return
    }

    const apiKey = localStorage.getItem('tarot_api_key')
    const baseUrl = localStorage.getItem('tarot_api_base_url')
    const hasLocalConfig = Boolean(apiKey && baseUrl)

    if (!hasLocalConfig && !defaultLlmUsable) {
      showToast('请先在设置页面配置您的 API', 'warning')
      router.push('/settings')
      return
    }

    sessionStorage.setItem('tarot_question', question)
    sessionStorage.setItem('tarot_spread', selectedSpread)

    router.push('/draw')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent selection:bg-[#9a2b2b]/20">
      
      {/* Decorative Ink Stains - CSS generated */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-stone-900/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-stone-800/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-16 space-y-6 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-stone-300 bg-white/50 text-xs font-serif uppercase tracking-[0.2em] text-stone-600">
            <span className="text-[#9a2b2b]">☯</span> Tarot & Destiny
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-ink">
            <span className="block mb-2">Easy Dynasty</span>
            <span className="text-2xl md:text-3xl font-light text-stone-500 block mt-4 tracking-widest">
              易 · 命理与智慧
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-stone-600 leading-relaxed font-serif">
            观星象，测八字，解塔罗。于墨香中探寻命运的轨迹，在静谧处聆听内心的回响。
          </p>
        </div>

        {/* API Warning */}
        {showApiWarning && (
          <div className="max-w-3xl mx-auto mb-12 animate-fade-in">
            <div className="ink-card bg-[#fffcf5] border-[#b4a078] p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center text-xl text-[#854d0e]">
                  ⚠️
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[#854d0e]">需要配置 API</h3>
                  <p className="text-sm text-[#854d0e]/80">请先配置您的 OpenAI 兼容 API 以开始占卜</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/settings')}
                className="px-6 py-2 border border-[#854d0e] text-[#854d0e] hover:bg-[#854d0e]/5 font-serif transition-colors text-sm"
              >
                前往设置
              </button>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto space-y-12">
          {/* Question Input */}
          <div className="ink-card p-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white/50 p-6 md:p-8 rounded-sm">
              <label htmlFor="question" className="block mb-4 text-sm font-serif font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#9a2b2b] inline-block"></span>
                您的问题
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="请输入您心中的疑惑..."
                rows={3}
                className="w-full bg-transparent border-b-2 border-stone-200 text-xl md:text-2xl text-ink placeholder:text-stone-400 focus:outline-none focus:border-stone-800 transition-colors resize-none py-4 font-serif"
              />
            </div>
          </div>

          {/* Spread Selection */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="mb-8 flex items-center gap-3 text-xl font-serif text-ink">
              <span className="text-2xl text-[#9a2b2b]">🃏</span> 选择牌阵
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {spreadsData.spreads.map((spread: Spread) => (
                <div
                  key={spread.id}
                  onClick={() => setSelectedSpread(spread.id)}
                  className={`group relative cursor-pointer p-6 transition-all duration-500 border rounded-sm ${selectedSpread === spread.id
                      ? 'bg-stone-100 border-stone-800 shadow-md'
                      : 'bg-white/60 border-stone-200 hover:border-stone-400 hover:bg-white/80'
                    }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`text-lg font-serif font-bold mb-1 transition-colors ${selectedSpread === spread.id ? 'text-black' : 'text-stone-700 group-hover:text-black'
                        }`}>
                        {spread.name}
                      </h3>
                      <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                        {spread.englishName}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-serif ${selectedSpread === spread.id
                        ? 'bg-stone-800 text-white'
                        : 'bg-stone-200 text-stone-500'
                      }`}>
                      {spread.cardCount} Cards
                    </span>
                  </div>
                  <p className="text-sm text-stone-500 leading-relaxed group-hover:text-stone-700 transition-colors font-serif">
                    {spread.description}
                  </p>
                  
                  {/* Decorative corner */}
                  {selectedSpread === spread.id && (
                     <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#9a2b2b]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={handleStartReading}
              disabled={!question.trim() || !selectedSpread}
              className="group relative px-16 py-4 bg-stone-900 text-white font-serif font-bold text-lg tracking-widest shadow-lg hover:bg-black hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="relative z-10 flex items-center gap-2">
                开始占卜
              </span>
              {/* Red seal decoration */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 border border-white/20 rounded-full opacity-50" />
            </button>

            <div className="flex gap-8 text-sm font-serif text-stone-500">
              <button onClick={() => router.push('/history')} className="hover:text-[#9a2b2b] transition-colors flex items-center gap-2">
                <span>📜</span> 历史记录
              </button>
              <button onClick={() => router.push('/settings')} className="hover:text-[#9a2b2b] transition-colors flex items-center gap-2">
                <span>⚙️</span> 系统设置
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}