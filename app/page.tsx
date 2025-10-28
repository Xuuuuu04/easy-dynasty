'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import spreadsData from '../data/spreads.json'

interface Spread {
  id: string
  name: string
  englishName: string
  description: string
  cardCount: number
}

export default function Home() {
  const [question, setQuestion] = useState('')
  const [selectedSpread, setSelectedSpread] = useState<string>('')
  const [showApiWarning, setShowApiWarning] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 检查是否已配置 API
    const checkApiConfig = () => {
      const apiKey = localStorage.getItem('tarot_api_key')
      const baseUrl = localStorage.getItem('tarot_api_base_url')
      
      if (!apiKey || !baseUrl) {
        setShowApiWarning(true)
      }
    }
    
    checkApiConfig()
  }, [])

  const handleStartReading = () => {
    if (!question.trim()) {
      alert('请输入您的问题')
      return
    }
    
    if (!selectedSpread) {
      alert('请选择一个牌阵')
      return
    }

    // 检查 API 配置
    const apiKey = localStorage.getItem('tarot_api_key')
    const baseUrl = localStorage.getItem('tarot_api_base_url')
    
    if (!apiKey || !baseUrl) {
      alert('请先在设置页面配置您的 API')
      router.push('/settings')
      return
    }

    // 保存问题和牌阵到 sessionStorage
    sessionStorage.setItem('tarot_question', question)
    sessionStorage.setItem('tarot_spread', selectedSpread)
    
    // 跳转到抽牌页面
    router.push('/draw')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050311] text-slate-100">
      <div className="stars-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.28),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(56,189,248,0.18),transparent_60%)]" />
      <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-purple-500/25 blur-[140px] animate-mystical-gradient" />
      <div className="absolute bottom-[-180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-[180px] animate-mystical-gradient" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-twinkle absolute left-[12%] top-28 h-2 w-2 rounded-full bg-purple-200/80 shadow-[0_0_12px_rgba(192,132,252,0.8)]" />
        <div className="animate-twinkle absolute right-[18%] top-40 h-2 w-2 rounded-full bg-amber-200/80 shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
        <div className="animate-twinkle absolute left-1/2 bottom-32 h-2 w-2 rounded-full bg-sky-200/80 shadow-[0_0_12px_rgba(125,211,252,0.7)]" />
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-14 space-y-5">
            <span className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.38em] text-purple-200/80 backdrop-blur">
              Tarot & Astrology
            </span>
            <h1 className="text-5xl md:text-6xl font-semibold font-[var(--font-display)] text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-violet-200 to-pink-200 drop-shadow-[0_10px_40px_rgba(124,58,237,0.45)]">
              🔮 TarotWhisper
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-slate-200/80 md:text-xl">
              探索内心的智慧，聆听塔罗的低语。输入您的问题，选择牌阵，让星辰与神秘之光为您汇聚答案。
            </p>
          </div>

          {/* API Warning */}
          {showApiWarning && (
            <div className="max-w-4xl mx-auto mb-10">
              <div className="rounded-2xl border border-yellow-400/40 bg-yellow-500/10 p-5 shadow-[0_20px_45px_rgba(202,138,4,0.22)] backdrop-blur">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">⚠️</span>
                    <div>
                      <h3 className="text-base font-semibold text-yellow-200">需要配置 API</h3>
                      <p className="text-sm text-yellow-100/80">
                        请先配置您的 OpenAI 兼容 API 以开始占卜
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/settings')}
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(251,191,36,0.35)] transition-transform hover:scale-[1.03]"
                  >
                    前往设置
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto">
            <div className="rounded-3xl border border-white/15 bg-white/5 p-8 shadow-[0_35px_120px_rgba(76,29,149,0.45)] backdrop-blur-xl md:p-10">
              {/* Question Input */}
              <div className="mb-10">
                <label
                  htmlFor="question"
                  className="mb-4 block text-left text-sm font-semibold uppercase tracking-[0.35em] text-purple-200/80"
                >
                  💭 您的问题
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />
                  <textarea
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="请输入您想要占卜的问题，例如：我最近的感情运势如何？我是否应该在今年内换工作？"
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-base text-slate-100 shadow-[0_15px_45px_rgba(24,24,45,0.35)] backdrop-blur focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-500/60 placeholder:text-slate-400"
                  />
                </div>
                <p className="mt-3 text-sm text-slate-300/80">
                  💡 提示：问题越具体，占卜结果越准确。避免过于宽泛的问题。
                </p>
              </div>

              {/* Spread Selection */}
              <div className="mb-10">
                <h2 className="mb-5 flex items-center gap-2 text-left text-sm font-semibold uppercase tracking-[0.35em] text-purple-200/80">
                  <span>🃏</span>
                  选择牌阵
                </h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {spreadsData.spreads.map((spread: Spread) => (
                    <div
                      key={spread.id}
                      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                        selectedSpread === spread.id
                          ? 'border-purple-300/70 bg-purple-500/15 shadow-[0_20px_55px_rgba(124,58,237,0.45)]'
                          : 'border-white/10 bg-white/5 shadow-[0_18px_40px_rgba(17,17,39,0.35)] hover:border-purple-300/40 hover:shadow-[0_25px_60px_rgba(124,58,237,0.35)]'
                      } cursor-pointer`}
                      onClick={() => setSelectedSpread(spread.id)}
                    >
                      <div
                        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
                          selectedSpread === spread.id
                            ? 'opacity-80'
                            : 'opacity-0 group-hover:opacity-50'
                        }`}
                      >
                        <div className="animate-mystical-gradient h-full w-full bg-[radial-gradient(circle_at_top,_rgba(192,132,252,0.18),transparent_60%)]" />
                      </div>
                      <div className="relative flex h-full flex-col gap-3 p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {spread.name}
                            </h3>
                            <p className="text-sm text-purple-200/70">{spread.englishName}</p>
                          </div>
                          <span className="rounded-full bg-purple-500/25 px-3 py-1 text-xs font-medium text-purple-100">
                            {spread.cardCount} 张牌
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-200/80">
                          {spread.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center">
                <button
                  onClick={handleStartReading}
                  disabled={!question.trim() || !selectedSpread}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 px-10 py-4 text-lg font-semibold text-white shadow-[0_25px_65px_rgba(232,121,249,0.45)] transition-all duration-300 hover:scale-[1.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                >
                  ✨ 开始占卜
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-10 text-center">
              <button
                onClick={() => router.push('/settings')}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                <span className="text-base">⚙️</span>
                API 设置
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
