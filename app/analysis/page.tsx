'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import spreadsData from '../../data/spreads.json'
import TarotCard from '../../components/TarotCard'
import { getDefaultLlmConfig, isDefaultLlmUsable } from '@/utils/llmConfig'

interface TarotCard {
  id: string | number
  name: string
  englishName: string
  suit: string
  uprightKeywords: string[]
  reversedKeywords: string[]
}

interface DrawnCard {
  card: TarotCard
  isReversed: boolean
  position: {
    id: number
    name: string
    description: string
  }
}

interface Spread {
  id: string
  name: string
  englishName: string
  description: string
  cardCount: number
  positions: Array<{
    id: number
    name: string
    description: string
  }>
}

export default function AnalysisPage() {
  const [question, setQuestion] = useState('')
  const [spread, setSpread] = useState<Spread | null>(null)
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([])
  const [analysis, setAnalysis] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const analysisContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 从 sessionStorage 获取数据
    const savedQuestion = sessionStorage.getItem('tarot_question')
    const savedSpreadId = sessionStorage.getItem('tarot_spread')
    const savedDrawnCards = sessionStorage.getItem('tarot_drawn_cards')
    
    if (!savedQuestion || !savedSpreadId || !savedDrawnCards) {
      router.push('/')
      return
    }

    setQuestion(savedQuestion)
    
    // 找到对应的牌阵
    const selectedSpread = spreadsData.spreads.find(s => s.id === savedSpreadId)
    if (!selectedSpread) {
      router.push('/')
      return
    }
    setSpread(selectedSpread)

    try {
      const cards = JSON.parse(savedDrawnCards) as DrawnCard[]
      setDrawnCards(cards)
      
      // 自动开始分析
      performAnalysis(savedQuestion, selectedSpread, cards)
    } catch (error) {
      console.error('解析抽牌数据失败:', error)
      router.push('/')
    }
  }, [router])

  const performAnalysis = async (question: string, spread: Spread, cards: DrawnCard[]) => {
    setIsLoading(true)
    setError('')

    try {
      // 从 localStorage 获取 API 配置
      const localBaseUrl = localStorage.getItem('tarot_api_base_url')?.trim() || null
      const localApiKey = localStorage.getItem('tarot_api_key')?.trim() || null
      const localModel = localStorage.getItem('tarot_api_model')?.trim() || null

      const hasLocalConfig = Boolean(localBaseUrl && localApiKey)
      const defaultConfig = getDefaultLlmConfig()
      const useDefaultConfig = !hasLocalConfig && isDefaultLlmUsable()

      const baseUrl = hasLocalConfig
        ? localBaseUrl
        : useDefaultConfig
        ? defaultConfig.baseUrl
        : null

      const apiKey = hasLocalConfig
        ? localApiKey
        : useDefaultConfig
        ? defaultConfig.apiKey
        : null

      const model =
        (hasLocalConfig ? localModel : null) ??
        (useDefaultConfig ? defaultConfig.model : null) ??
        'gpt-4o-mini'

      if (!baseUrl || !apiKey) {
        setError('API 配置缺失，请前往设置页面配置')
        return
      }

      const resolvedBaseUrl = baseUrl
      const resolvedApiKey = apiKey

      // 构建系统提示词
      const systemPrompt = `你是一位经验丰富、富有同情心和洞察力的塔罗牌占卜大师。
你的任务是基于用户提供的问题、选择的牌阵、以及抽到的每一张牌（包括其在牌阵中的位置、牌名和正逆位）来进行一次完整且深入的分析。

你的分析应遵循以下准则：
1. **综合解读：** 不要孤立地解释每一张牌。你需要将所有牌串联起来，讲述一个完整的故事，特别是要分析牌与牌之间的相互影响。
2. **深入位置含义：** 重点分析每张牌在其特定"位置"上的含义。例如，"死神"在"过去"和在"未来"的位置，其解读是完全不同的。
3. **结合正逆位：** 必须明确指出每张牌是正位还是逆位，并根据其正逆状态进行解读。
4. **富有同情心：** 你的语气应该是建设性、支持性和富有同理心的，即使是面对"坏牌"（如高塔、死神），也要提供积极的建议和成长的视角。
5. **不作断言：** 避免使用"你一定会..."这样的宿命论断言。使用"这可能意味着..."、"这暗示了..."或"这建议你..."等更具指导性的语言。
6. **安全边界：** 严格禁止提供任何具体的医疗、法律或金融投资建议。如果问题涉及这些领域，请将解读引向精神和心态层面，并提醒用户寻求专业人士的帮助。
7. **结构清晰：** 在分析的最后，请给出一个简洁明了的总结和建议。`

      // 构建用户提示词
      const cardsData = cards.map(drawnCard => ({
        position_name: drawnCard.position.name,
        card_name: drawnCard.card.name,
        orientation: drawnCard.isReversed ? '逆位' : '正位'
      }))

      const userPrompt = `你好，塔罗大师。我需要你的指引。

[我的问题]
${question}

[我选择的牌阵]
${spread.name}

[我抽到的牌]
${JSON.stringify({ cards: cardsData }, null, 2)}

请根据以上所有信息，为我提供详细的解读和建议。`

      // 调用 API
      const response = await fetch(`${resolvedBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resolvedApiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          stream: true
        })
      })

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`)
      }

      // 处理流式响应
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应流')
      }

      let analysisText = ''
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                analysisText += content
                setAnalysis(analysisText)
                
                // 自动滚动到底部
                setTimeout(() => {
                  if (analysisContainerRef.current) {
                    analysisContainerRef.current.scrollTop = analysisContainerRef.current.scrollHeight
                  }
                }, 10)
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }

    } catch (error) {
      console.error('分析失败:', error)
      setError(error instanceof Error ? error.message : '分析过程中出现未知错误')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewReading = () => {
    // 清除 sessionStorage
    sessionStorage.removeItem('tarot_question')
    sessionStorage.removeItem('tarot_spread')
    sessionStorage.removeItem('tarot_drawn_cards')
    router.push('/')
  }

  if (!spread || drawnCards.length === 0) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#050311] flex items-center justify-center">
        <div className="stars-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.28),transparent_60%)]" />
        <div className="relative text-center space-y-4">
          <div className="relative mx-auto h-20 w-20">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-purple-400 border-r-pink-400"></div>
          </div>
          <div className="text-xl font-semibold text-white font-[var(--font-display)]">
            正在汇聚塔罗能量...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050311] text-slate-100">
      <div className="stars-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.28),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(56,189,248,0.18),transparent_60%)]" />
      <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-purple-500/25 blur-[140px] animate-mystical-gradient" />
      <div className="absolute bottom-[-180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-[180px] animate-mystical-gradient" />

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10 space-y-4">
              <div className="inline-flex items-center justify-center gap-3">
                <span className="text-4xl">🔮</span>
                <h1 className="text-3xl md:text-4xl font-semibold font-[var(--font-display)] text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-violet-200 to-pink-200 drop-shadow-[0_10px_40px_rgba(124,58,237,0.45)]">
                  塔罗解读
                </h1>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl shadow-[0_20px_60px_rgba(76,29,149,0.35)] max-w-3xl mx-auto">
                <p className="text-slate-200/90 text-sm mb-2">
                  <span className="text-purple-200 font-medium">您的问题：</span>
                  {question}
                </p>
                <p className="text-purple-200/80 text-sm">
                  <span className="text-pink-200 font-medium">牌阵：</span>
                  {spread.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Cards Display */}
              <div className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-[0_35px_120px_rgba(76,29,149,0.45)] backdrop-blur-xl flex flex-col lg:sticky lg:top-8">
                <h2 className="text-xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-100 to-pink-100 mb-6 font-[var(--font-display)]">
                  抽到的牌
                </h2>
                <div className="flex-1 space-y-5 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                  {drawnCards.map((drawnCard, index) => (
                    <div
                      key={index}
                      className="group rounded-2xl border border-white/10 bg-black/20 p-4 transition-all hover:border-purple-300/40 hover:shadow-[0_15px_45px_rgba(124,58,237,0.3)]"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-sm font-medium text-purple-200">
                          {drawnCard.position.name}
                        </div>
                        <div
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            drawnCard.isReversed
                              ? 'bg-amber-500/20 text-amber-200'
                              : 'bg-emerald-500/20 text-emerald-200'
                          }`}
                        >
                          {drawnCard.isReversed ? '逆位' : '正位'}
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-20 flex-shrink-0">
                          <TarotCard
                            cardId={drawnCard.card.id}
                            cardName={drawnCard.card.name}
                            englishName={drawnCard.card.englishName}
                            isReversed={drawnCard.isReversed}
                            isRevealed={true}
                            className="w-full"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="mb-1 text-base font-bold text-white">
                            {drawnCard.card.name}
                          </div>
                          <div className="mb-2 text-xs text-purple-200/70">
                            {drawnCard.card.englishName}
                          </div>
                          <div className="mb-3 text-xs leading-relaxed text-slate-300/70">
                            {drawnCard.position.description}
                          </div>

                          <div>
                            <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                              关键词
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {(drawnCard.isReversed
                                ? drawnCard.card.reversedKeywords
                                : drawnCard.card.uprightKeywords
                              )
                                .slice(0, 3)
                                .map((keyword, i) => (
                                  <span
                                    key={i}
                                    className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[11px] text-purple-200"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            </div>

            {/* Analysis Display */}
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-[0_35px_120px_rgba(76,29,149,0.45)] backdrop-blur-xl flex flex-col">
              <h2 className="text-xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-100 to-pink-100 mb-6 font-[var(--font-display)]">
                塔罗解读
              </h2>

              <div
                ref={analysisContainerRef}
                className="flex-1 max-h-[calc(100vh-250px)] overflow-y-auto scroll-smooth pr-2"
              >
                {error && (
                  <div className="mb-6 rounded-2xl border border-red-400/40 bg-red-500/10 p-4 shadow-[0_15px_40px_rgba(220,38,38,0.3)]">
                    <div className="mb-2 text-sm font-semibold text-red-200">
                      分析失败
                    </div>
                    <div className="text-sm text-red-100/80">{error}</div>
                    <button
                      onClick={() => router.push('/settings')}
                      className="mt-3 inline-flex rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-sm font-medium text-white shadow-[0_10px_25px_rgba(220,38,38,0.35)] transition-transform hover:scale-[1.03]"
                    >
                      检查设置
                    </button>
                  </div>
                )}

                {isLoading && (
                  <div className="py-12 text-center">
                    <div className="relative mx-auto mb-6 h-16 w-16">
                      <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
                      <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-purple-400 border-r-pink-400"></div>
                    </div>
                    <div className="mb-2 text-base font-semibold text-white">
                      塔罗大师正在为您解读...
                    </div>
                    <div className="text-sm text-slate-300/70">
                      这可能需要几十秒时间
                    </div>
                  </div>
                )}

                {analysis && (
                  <div className="prose prose-invert max-w-none prose-headings:font-[var(--font-display)] prose-headings:text-white prose-p:text-slate-200 prose-p:leading-relaxed prose-strong:text-white prose-em:text-purple-300 prose-ul:text-slate-200 prose-ol:text-slate-200 prose-li:text-slate-200">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="mb-4 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-100 to-pink-100">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-3 mt-6 text-xl font-bold text-white">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mb-2 mt-4 text-lg font-semibold text-purple-100">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="mb-4 leading-relaxed text-slate-200">
                            {children}
                          </p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-white">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="text-purple-300">{children}</em>
                        ),
                        ul: ({ children }) => (
                          <ul className="mb-4 space-y-1 pl-6 text-slate-200">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="mb-4 space-y-1 pl-6 text-slate-200">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-slate-200">{children}</li>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="my-4 border-l-4 border-purple-400/60 bg-purple-500/10 py-2 pl-4 italic text-purple-200 rounded-r-lg">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {analysis}
                    </ReactMarkdown>
                  </div>
                )}

                {!isLoading && !error && !analysis && (
                  <div className="py-12 text-center text-slate-400">
                    等待分析开始...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleNewReading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 px-8 py-3 text-base font-semibold text-white shadow-[0_25px_65px_rgba(232,121,249,0.45)] transition-all duration-300 hover:scale-[1.04]"
            >
              <span className="text-lg">🔮</span>
              新的占卜
            </button>

            <button
              onClick={() => router.push('/settings')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3 text-base font-medium text-slate-200 backdrop-blur transition-all hover:border-white/40 hover:bg-white/10"
            >
              <span className="text-lg">⚙️</span>
              设置
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}
