'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import FanDeck from '@/components/FanDeck'
import SpreadLayout from '@/components/SpreadLayout'
import TarotChat from '@/components/TarotChat'
import ExportReportModal from '@/components/ExportReportModal'
import { useToast } from '@/components/Toast'
import spreadsData from '../../data/spreads.json'
import tarotCardsData from '../../data/tarot-cards.json'
import type { TarotCard, Spread, DrawnCard, ChatMessage, ApiConfig } from '@/types/tarot'
import { analyzeTarotReading } from '@/hooks/useTarotAnalysis'
import { constructTarotPrompts } from '@/utils/prompts'
import { preprocessMarkdown } from '@/utils/markdown'
import { TarotIcon, ChartIcon } from '@/components/Icons'
import CardShowcase from '@/components/CardShowcase'

// Clean AI response markdown code blocks
const cleanAiResponse = (text: string) => text.replace(/^```markdown\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '')

export default function DrawPage() {
  const router = useRouter()
  const { showToast } = useToast()

  const [question, setQuestion] = useState('')
  const [spread, setSpread] = useState<Spread | null>(null)
  const [deck, setDeck] = useState<TarotCard[]>([])
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([])
  const [drawnIndices, setDrawnIndices] = useState<number[]>([])
  const [showcasingCard, setShowcasingCard] = useState<TarotCard | null>(null)
  const [isDrawingComplete, setIsDrawingComplete] = useState(false)
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const analysisContainerRef = useRef<HTMLDivElement>(null)

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

  // Updated Model Default
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    baseUrl: null,
    apiKey: null,
    model: 'Qwen/Qwen3-Next-80B-A3B-Instruct'
  })

  // Setup mode check
  const [setupMode, setSetupMode] = useState(true)

  useEffect(() => {
    // Only fetch config on client mount
    const localModel = localStorage.getItem('tarot_api_model')?.trim() || 'Qwen/Qwen3-Next-80B-A3B-Instruct'
    setApiConfig({
      baseUrl: localStorage.getItem('tarot_api_base_url')?.trim() || null,
      apiKey: localStorage.getItem('tarot_api_key')?.trim() || null,
      model: localModel
    })

    const allCards = [
      ...tarotCardsData.majorArcana,
      ...tarotCardsData.minorArcana.wands,
      ...tarotCardsData.minorArcana.cups,
      ...tarotCardsData.minorArcana.swords,
      ...tarotCardsData.minorArcana.pentacles
    ]
    const shuffled = [...allCards].sort(() => Math.random() - 0.5)
    setDeck(shuffled)
  }, [])

  useEffect(() => {
    if (analysis && analysisContainerRef.current) {
      analysisContainerRef.current.scrollTop = analysisContainerRef.current.scrollHeight
    }
  }, [analysis])

  const handleStartDraw = (q: string, sId: string) => {
    setQuestion(q)
    const foundSpread = spreadsData.spreads.find(s => s.id === sId)
    if (foundSpread) {
      setSpread(foundSpread)
      setSetupMode(false)
    }
  }

  const handleCardDraw = (cardIndex: number) => {
    if (!spread || drawnCards.length >= spread.cardCount) return
    if (drawnIndices.includes(cardIndex)) return
    if (showcasingCard) return

    const selectedCard = deck[cardIndex]

    // 1. Remove from Deck immediately
    setDrawnIndices(prev => [...prev, cardIndex])

    // 2. Start Showcase Animation
    setShowcasingCard(selectedCard)
  }

  const handleShowcaseComplete = () => {
    if (!showcasingCard || !spread) return

    const selectedCard = showcasingCard
    const isReversed = Math.random() > 0.8
    const positionInfo = spread.positions[drawnCards.length]

    const newDrawnCard: DrawnCard = {
      card: selectedCard,
      isReversed,
      position: positionInfo
    }

    const newDrawnCards = [...drawnCards, newDrawnCard]
    setDrawnCards(newDrawnCards)
    setShowcasingCard(null)

    if (newDrawnCards.length === spread.cardCount) {
      setTimeout(() => {
        setIsDrawingComplete(true)
        startAnalysis(newDrawnCards)
      }, 1000)
    }
  }

  const startAnalysis = async (cards: DrawnCard[]) => {
    setIsAnalysing(true)
    setAnalysis('')
    try {
      const { systemPrompt, userPrompt } = constructTarotPrompts(
        question,
        spread!.name,
        spread!.id,
        cards
      )

      const fullResult = await analyzeTarotReading(question, spread!, cards, (currentText) => {
        setAnalysis(currentText)
      });

      if (fullResult) {
        setAnalysis(fullResult)
        setChatHistory([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
          { role: 'assistant', content: fullResult }
        ])
      }
    } catch (err) {
      console.error(err)
      showToast('解读服务繁忙', 'error')
      setAnalysis("抱歉，天机混沌，暂无法获取详细解读。")
    } finally {
      setIsAnalysing(false)
    }
  }

  const handleExportClick = () => {
    setIsExportModalOpen(true)
  }

  const handleRestart = () => {
    setQuestion('')
    setSpread(null)
    setDrawnCards([])
    setDrawnIndices([])
    setIsDrawingComplete(false)
    setAnalysis('')
    setSetupMode(true)

    // Reshuffle
    const allCards = [
      ...tarotCardsData.majorArcana,
      ...tarotCardsData.minorArcana.wands,
      ...tarotCardsData.minorArcana.cups,
      ...tarotCardsData.minorArcana.swords,
      ...tarotCardsData.minorArcana.pentacles
    ]
    const shuffled = [...allCards].sort(() => Math.random() - 0.5)
    setDeck(shuffled)
  }

  // Setup/Input View
  if (setupMode) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-[#f5f5f0] p-4 relative overflow-hidden">
        {/* Background Texture & Decoration */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20" style={{ backgroundImage: 'url("/rice-paper-2.png")' }}></div>
        <div className="absolute top-10 right-10 pointer-events-none opacity-10 font-serif writing-vertical text-6xl text-[#9a2b2b] select-none">
          易朝·塔罗
        </div>

        {/* Card */}
        <div className="relative z-10 w-full max-w-lg bg-white/90 backdrop-blur-xl p-10 md:p-12 rounded-sm shadow-[0_4px_30px_rgba(0,0,0,0.1)] border border-[#e7e5e4] flex flex-col gap-10">

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-[#9a2b2b] rounded-full flex items-center justify-center shadow-lg mb-6">
              <TarotIcon className="w-8 h-8 text-[#f5f5f0]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-ink tracking-[0.2em] mb-2">
              心诚则灵
            </h1>
            <p className="text-sm font-serif text-stone-500 tracking-widest uppercase">
              EasyDynasty Tarot Interpretation
            </p>
          </div>

          <div className="space-y-8">
            {/* Question Input */}
            <div className="group relative">
              <label className="block text-xs font-bold text-[#9a2b2b] uppercase tracking-[0.3em] mb-3 opacity-70 group-focus-within:opacity-100 transition-opacity">
                你的疑问 / Question
              </label>
              <input
                type="text"
                className="w-full bg-transparent border-b-[1.5px] border-stone-300 py-3 text-lg md:text-xl font-serif text-ink focus:outline-none focus:border-[#9a2b2b] placeholder:text-stone-300 transition-all duration-300"
                placeholder="请在此输入心中所惑..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#9a2b2b] transition-all duration-500 group-focus-within:w-full"></div>
            </div>

            {/* Spread Select */}
            <div className="group relative">
              <label className="block text-xs font-bold text-[#9a2b2b] uppercase tracking-[0.3em] mb-3 opacity-70 group-focus-within:opacity-100 transition-opacity">
                选择牌阵 / Spread
              </label>
              <div className="relative w-full">
                <select
                  className="w-full appearance-none bg-transparent border-b-[1.5px] border-stone-300 py-3 text-lg md:text-xl font-serif text-ink focus:outline-none focus:border-[#9a2b2b] cursor-pointer"
                  onChange={(e) => {
                    const s = spreadsData.spreads.find(sp => sp.id === e.target.value);
                    if (s) setSpread(s);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled className="text-stone-300">请选择适宜的牌阵</option>
                  {spreadsData.spreads.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.cardCount}张)</option>
                  ))}
                </select>
                {/* Custom Arrow */}
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 group-hover:text-[#9a2b2b] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </div>
                <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#9a2b2b] transition-all duration-500 group-focus-within:w-full"></div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                onClick={() => {
                  if (!question.trim()) { showToast('请输入问题', 'warning'); return; }
                  if (!spread) { showToast('请选择牌阵', 'warning'); return; }
                  handleStartDraw(question, spread.id)
                }}
                className="btn-seal w-full py-4 text-lg shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[1px] transition-all duration-300"
              >
                <span>开启卦象</span>
                <span className="opacity-80 text-sm font-normal">Start Divination</span>
              </button>
            </div>
          </div>

          {/* Footer Decor */}
          <div className="text-center">
            <div className="inline-block w-full h-[1px] bg-gradient-to-r from-transparent via-[#9a2b2b]/20 to-transparent mb-4"></div>
            <p className="text-[10px] text-stone-400 font-serif tracking-widest">
              命运掌握在自己手中 · 易朝 AI 辅助解读
            </p>
          </div>

        </div>
      </div>
    )
  }

  if (!spread) return null

  return (
    <div className="min-h-screen pt-20 md:pt-28 pb-12 px-4 relative overflow-hidden bg-[#f5f5f0]">

      {/* Background Texture */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10" style={{ backgroundImage: 'url("/rice-paper-2.png")' }}></div>

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col gap-8 md:gap-12">

        {/* Header Question */}
        <div className="text-center space-y-3 md:space-y-4 animate-fade-in">
          <div className="inline-block border-b border-[#9a2b2b]/30 pb-2 px-4 md:px-8">
            <h2 className="text-lg md:text-2xl font-serif font-bold text-ink tracking-widest">
              {question}
            </h2>
          </div>
          <p className="text-stone-500 text-xs md:text-sm font-serif uppercase tracking-widest">
            {spread.name} · {isDrawingComplete ? '启示呈现' : `请抽取 ${spread.cardCount - drawnCards.length} 张`}
          </p>
        </div>

        {/* Interaction Area */}
        <div className="relative min-h-[50vh] flex flex-col items-center justify-start gap-8 md:gap-12">

          {!isDrawingComplete && (
            <div className="w-full flex justify-center animate-fade-in scale-75 md:scale-100 overflow-x-hidden">
              <FanDeck
                totalCards={deck.length}
                selectedCards={drawnIndices}
                onCardSelect={handleCardDraw}
                disabled={drawnCards.length >= spread.cardCount}
              />
            </div>
          )}

          <div className={`transition-all duration-1000 transform ${isDrawingComplete ? 'scale-75 md:scale-100' : 'scale-50 md:scale-90 opacity-80'}`}>
            <SpreadLayout
              spreadId={spread.id}
              positions={spread.positions}
              drawnCards={drawnCards}
              onPositionClick={() => { }}
              canDrawAtPosition={() => false}
              isDrawing={false}
              drawingPositionId={null}
            />
          </div>

          {isDrawingComplete && (
            <div className="w-full max-w-4xl animate-slide-up space-y-8 px-2">

              <div className="ink-card p-6 md:p-12 bg-white/95 relative min-h-[300px] border-stone-300">
                <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <ChartIcon className="w-5 h-5 text-[#9a2b2b]" />
                    <h3 className="text-lg md:text-xl font-serif font-bold text-ink tracking-widest">
                      易朝 · 启示录
                    </h3>
                  </div>
                  {analysis && (
                    <button
                      onClick={handleExportClick}
                      className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200"
                    >
                      {/* Fixed SVG - using Standard Feather Download Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>导出</span>
                    </button>
                  )}
                </div>

                <div
                  ref={analysisContainerRef}
                  className="prose prose-stone max-w-none font-serif text-base md:text-lg leading-loose text-stone-800 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar"
                >
                  {!analysis && isAnalysing ? (
                    <div className="flex items-center justify-center h-32 gap-3 text-stone-400 tracking-[0.2em]">
                      <div className="w-1.5 h-1.5 bg-[#9a2b2b] rounded-full animate-ping"></div>
                      <span>推演中...</span>
                    </div>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]} // Enable GFM for tables
                      components={{
                        h1: ({ children }) => <h1 className="mb-6 text-xl md:text-2xl font-bold text-ink border-b-2 border-[#9a2b2b] pb-1 inline-block">{children}</h1>,
                        h2: ({ children }) => <h2 className="mb-4 mt-8 text-lg md:text-xl font-bold text-ink border-b border-stone-200 pb-1">{children}</h2>,
                        h3: ({ children }) => <h3 className="mb-2 mt-6 text-base md:text-lg font-bold text-[#9a2b2b]">{children}</h3>,
                        p: ({ children }) => <p className="mb-4 leading-relaxed text-stone-700 text-sm md:text-base">{children}</p>,
                        blockquote: ({ children }) => <blockquote className="my-6 border-l-2 border-[#9a2b2b] bg-stone-50 py-3 pl-5 italic text-stone-600 rounded-sm">{children}</blockquote>,
                        // Add table styling
                        table: ({ children }) => <div className="overflow-x-auto my-6"><table className="min-w-full text-left text-sm whitespace-nowrap">{children}</table></div>,
                        th: ({ children }) => <th className="font-bold border-b border-stone-300 p-2 text-[#9a2b2b]">{children}</th>,
                        td: ({ children }) => <td className="border-b border-stone-100 p-2">{children}</td>,
                      }}
                    >
                      {preprocessMarkdown(analysis)}
                    </ReactMarkdown>
                  )}
                </div>

                {!isAnalysing && analysis && (
                  <TarotChat
                    initialHistory={chatHistory}
                    apiConfig={apiConfig}
                  />
                )}
              </div>

              <div className="flex justify-center pt-4 pb-12">
                <button onClick={handleRestart} className="btn-seal text-base md:text-lg px-10 py-3 flex items-center gap-2">
                  <TarotIcon className="w-4 h-4" />
                  <span>重起一卦</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        type="tarot"
        data={{
          question,
          spreadName: spread?.name || '',
          spreadId: spread?.id,
          positions: spread?.positions,
          drawnCards,
          analysis: cleanAiResponse(preprocessMarkdown(analysis))
        }}
        userName={'Seeker'}
      />

      {showcasingCard && (
        <CardShowcase
          card={showcasingCard}
          onComplete={handleShowcaseComplete}
        />
      )}
    </div>
  )
}
