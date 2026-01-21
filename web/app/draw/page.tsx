'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import FanDeck from '@/components/FanDeck'
import SpreadLayout from '@/components/SpreadLayout'
import TarotChat from '@/components/TarotChat'
import { useToast } from '@/components/Toast'
import spreadsData from '../../data/spreads.json'
import tarotCardsData from '../../data/tarot-cards.json'
import type { TarotCard, Spread, DrawnCard, ChatMessage, ApiConfig } from '@/types/tarot'
import { analyzeTarotReading } from '@/hooks/useTarotAnalysis'
import { constructTarotPrompts } from '@/utils/prompts'
import { TarotIcon, ChartIcon } from '@/components/Icons'

export default function DrawPage() {
  const router = useRouter()
  const { showToast } = useToast()
  
  const [question, setQuestion] = useState('')
  const [spread, setSpread] = useState<Spread | null>(null)
  const [deck, setDeck] = useState<TarotCard[]>([])
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([])
  const [drawnIndices, setDrawnIndices] = useState<number[]>([])
  const [isDrawingComplete, setIsDrawingComplete] = useState(false)
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [user, setUser] = useState<any>(null)
  const analysisContainerRef = useRef<HTMLDivElement>(null)

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
      baseUrl: null,
      apiKey: null,
      model: 'moonshotai/Kimi-K2-Instruct-0905'
  })

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setUser(data);
    } catch (err) {
        console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        router.push('/');
        return;
    }
    fetchUser();
  }, [router]);

  useEffect(() => {
    const storedQuestion = sessionStorage.getItem('tarot_question')
    const storedSpreadId = sessionStorage.getItem('tarot_spread')

    if (!storedQuestion || !storedSpreadId) {
      router.push('/dashboard')
      return
    }

    setQuestion(storedQuestion)
    const foundSpread = spreadsData.spreads.find(s => s.id === storedSpreadId)
    if (foundSpread) {
      setSpread(foundSpread)
    }

    const localModel = localStorage.getItem('tarot_api_model')?.trim() || 'moonshotai/Kimi-K2-Instruct-0905'
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
  }, [router])

  useEffect(() => {
    if (analysis && analysisContainerRef.current) {
       analysisContainerRef.current.scrollTop = analysisContainerRef.current.scrollHeight
    }
  }, [analysis])

  const handleCardDraw = (cardIndex: number) => {
    if (!spread || drawnCards.length >= spread.cardCount) return
    if (drawnIndices.includes(cardIndex)) return

    const selectedCard = deck[cardIndex]
    const isReversed = Math.random() > 0.8 
    const positionInfo = spread.positions[drawnCards.length]

    const newDrawnCard: DrawnCard = {
      card: selectedCard,
      isReversed,
      position: positionInfo
    }

    const newDrawnCards = [...drawnCards, newDrawnCard]
    setDrawnCards(newDrawnCards)
    setDrawnIndices([...drawnIndices, cardIndex])

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
      fetchUser();
    } catch (err) {
      console.error(err)
      showToast('解读服务繁忙', 'error')
      setAnalysis("抱歉，天机混沌，暂无法获取详细解读。")
    } finally {
      setIsAnalysing(false)
    }
  }

  const handleRestart = () => router.push('/dashboard')

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
                    onPositionClick={() => {}}
                    canDrawAtPosition={() => false}
                    isDrawing={false}
                    drawingPositionId={null}
                />
            </div>

            {isDrawingComplete && (
                <div className="w-full max-w-4xl animate-slide-up space-y-8 px-2">
                    
                    <div className="ink-card p-6 md:p-12 bg-white/95 relative min-h-[300px] border-stone-300">
                        <div className="flex items-center gap-3 mb-6 md:mb-8 border-b border-stone-100 pb-4">
                            <ChartIcon className="w-5 h-5 text-[#9a2b2b]" />
                            <h3 className="text-lg md:text-xl font-serif font-bold text-ink tracking-widest">
                                易朝 · 启示录
                            </h3>
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
                                    components={{
                                        h1: ({ children }) => <h1 className="mb-6 text-xl md:text-2xl font-bold text-ink border-b-2 border-[#9a2b2b] pb-1 inline-block">{children}</h1>,
                                        h2: ({ children }) => <h2 className="mb-4 mt-8 text-lg md:text-xl font-bold text-ink border-b border-stone-200 pb-1">{children}</h2>,
                                        h3: ({ children }) => <h3 className="mb-2 mt-6 text-base md:text-lg font-bold text-[#9a2b2b]">{children}</h3>,
                                        p: ({ children }) => <p className="mb-4 leading-relaxed text-stone-700 text-sm md:text-base">{children}</p>,
                                        blockquote: ({ children }) => <blockquote className="my-6 border-l-2 border-[#9a2b2b] bg-stone-50 py-3 pl-5 italic text-stone-600 rounded-sm">{children}</blockquote>,
                                      }}
                                >
                                    {analysis}
                                </ReactMarkdown>
                            )}
                        </div>

                        {!isAnalysing && analysis && (
                          (!user || user.tier === 'free') ? (
                            <div className="mt-8 border-t border-stone-100 pt-8 text-center">
                                <p className="text-stone-400 text-xs">进一步提问功能仅限 VIP/SVIP 用户</p>
                                <button onClick={() => router.push('/vip')} className="text-[#9a2b2b] text-[10px] font-bold tracking-widest mt-2 hover:underline">升级权限 →</button>
                            </div>
                          ) : (
                            <TarotChat 
                               initialHistory={chatHistory}
                               apiConfig={apiConfig}
                            />
                          )
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
    </div>
  )
}
