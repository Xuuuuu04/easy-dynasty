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

  // Auth Guard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        router.push('/');
        return;
    }
    fetchUser();
  }, [router]);

  useEffect(() => {
    // 1. Recover state
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

    // Load API Config
    const localBaseUrl = localStorage.getItem('tarot_api_base_url')?.trim() || null
    const localApiKey = localStorage.getItem('tarot_api_key')?.trim() || null
    const localModel = localStorage.getItem('tarot_api_model')?.trim() || 'Qwen/Qwen3-Next-80B-A3B-Instruct'
    setApiConfig({
        baseUrl: localBaseUrl,
        apiKey: localApiKey,
        model: localModel
    })

    // 2. Shuffle Deck
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

  // Auto scroll effect
  useEffect(() => {
    if (analysis && analysisContainerRef.current) {
       analysisContainerRef.current.scrollTop = analysisContainerRef.current.scrollHeight
    }
  }, [analysis])

  const handleCardDraw = (cardIndex: number) => {
    if (!spread || drawnCards.length >= spread.cardCount) return
    if (drawnIndices.includes(cardIndex)) return

    const selectedCard = deck[cardIndex]

    const isReversed = Math.random() > 0.8 // 20% chance reversed
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
      // Create initial history base prompts
      const { systemPrompt, userPrompt } = constructTarotPrompts(
        question,
        spread!.name,
        spread!.id,
        cards
      )
      
      const fullAnalysis = await analyzeTarotReading(question, spread!, cards, (chunk) => {
          setAnalysis(chunk)
      });
      
      setAnalysis(fullAnalysis)
      
      // Update chat history with the initial analysis
      setChatHistory([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
          { role: 'assistant', content: fullAnalysis }
      ])
      
      // Refresh user info to update quota
      fetchUser();
      
    } catch (err) {
      console.error(err)
      showToast('解读服务暂时繁忙，请稍后再试', 'error')
      setAnalysis("抱歉，天机混沌，暂无法获取详细解读。请静心片刻，感受牌面传达的直觉。")
    } finally {
      setIsAnalysing(false)
    }
  }

  const handleRestart = () => {
    router.push('/dashboard')
  }

  if (!spread) return null

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative overflow-hidden">
      
      {/* Background Atmosphere */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')]"></div>

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col gap-12">
        
        {/* Header Question */}
        <div className="text-center space-y-4 animate-fade-in">
           <div className="inline-block border-b-2 border-[#9a2b2b] pb-2 px-8">
              <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-800 tracking-widest">
                 {question}
              </h2>
           </div>
           <p className="text-stone-600 text-sm font-serif">
              {spread.name} · {isDrawingComplete ? '解读中' : `请抽取 ${spread.cardCount - drawnCards.length} 张牌`}
           </p>
           {user && (
               <div className="flex justify-center gap-4 mt-2">
                   <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full border border-stone-200">
                       今日剩余次数: {user.tarot_limit - user.tarot_used_today} / {user.tarot_limit}
                   </span>
               </div>
           )}
        </div>

        {/* Main Interaction Area */}
        <div className="relative min-h-[60vh] flex flex-col items-center justify-start gap-12">
            
            {/* 1. Deck Area (Visible when drawing) */}
            {!isDrawingComplete && (
                <div className="w-full flex justify-center animate-fade-in">
                    <FanDeck 
                        totalCards={deck.length} 
                        selectedCards={drawnIndices}
                        onCardSelect={handleCardDraw} 
                        disabled={drawnCards.length >= spread.cardCount}
                    />
                </div>
            )}

            {/* 2. Spread Display (Cards placed on table) */}
            <div className={`transition-all duration-1000 ${isDrawingComplete ? 'scale-100' : 'scale-90 opacity-90'}`}>
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

            {/* 3. Analysis Panel (Appears after drawing) */}
            {isDrawingComplete && (
                <div className="w-full max-w-4xl animate-slide-up space-y-8">
                    
                    {/* AI Interpretation Box */}
                    <div className="ink-card p-8 md:p-12 bg-white/90 border-t-4 border-[#9a2b2b] shadow-lg relative min-h-[300px]">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-8 border-b border-stone-200 pb-4">
                            {/* Custom Ink Icon */}
                            <svg className="w-6 h-6 text-[#9a2b2b]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-1.07 3.97-2.9 5.39z"/>
                            </svg>
                            <h3 className="text-xl font-serif font-bold text-ink tracking-widest">
                                易 · 启示
                            </h3>
                        </div>

                        {/* Content */}
                        <div 
                            ref={analysisContainerRef}
                            className="prose prose-stone max-w-none font-serif text-lg leading-loose text-stone-800 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar"
                        >
                            {!analysis && isAnalysing ? (
                                <div className="flex items-center justify-center h-20 gap-3 text-stone-500">
                                    <div className="w-2 h-2 bg-[#9a2b2b] rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-[#9a2b2b] rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-[#9a2b2b] rounded-full animate-bounce delay-150"></div>
                                    <span>星象推演中...</span>
                                </div>
                            ) : (
                                <ReactMarkdown
                                    components={{
                                        h1: ({ children }) => (
                                          <h1 className="mb-6 text-2xl font-bold font-display text-ink border-b-2 border-[#9a2b2b] pb-2 inline-block">
                                            {children}
                                          </h1>
                                        ),
                                        h2: ({ children }) => (
                                          <h2 className="mb-4 mt-8 text-xl font-bold text-ink border-b border-stone-300 pb-2">
                                            {children}
                                          </h2>
                                        ),
                                        h3: ({ children }) => (
                                          <h3 className="mb-3 mt-6 text-lg font-bold text-[#9a2b2b]">
                                            {children}
                                          </h3>
                                        ),
                                        p: ({ children }) => (
                                          <p className="mb-4 leading-relaxed text-stone-700">
                                            {children}
                                          </p>
                                        ),
                                        strong: ({ children }) => (
                                          <strong className="font-bold text-ink">
                                            {children}
                                          </strong>
                                        ),
                                        em: ({ children }) => (
                                          <em className="text-[#9a2b2b] not-italic font-medium">{children}</em>
                                        ),
                                        ul: ({ children }) => (
                                          <ul className="mb-4 space-y-2 pl-6 text-stone-700 list-disc marker:text-[#9a2b2b]">
                                            {children}
                                          </ul>
                                        ),
                                        ol: ({ children }) => (
                                          <ol className="mb-4 space-y-2 pl-6 text-stone-700 list-decimal marker:text-[#9a2b2b]">
                                            {children}
                                          </ol>
                                        ),
                                        li: ({ children }) => (
                                          <li className="pl-1">{children}</li>
                                        ),
                                        blockquote: ({ children }) => (
                                          <blockquote className="my-6 border-l-4 border-[#9a2b2b] bg-stone-100/50 py-4 pl-6 italic text-stone-600 rounded-r-lg">
                                            {children}
                                          </blockquote>
                                        ),
                                      }}
                                >
                                    {analysis}
                                </ReactMarkdown>
                            )}
                        </div>

                        {/* Chat Interface */}
                        {!isAnalysing && analysis && (
                          (!user || user.tier === 'free') ? (
                            <div className="mt-8 border-t border-stone-200 pt-8 text-center">
                                <p className="text-stone-400 text-sm">进一步提问功能仅限 VIP/SVIP 用户使用</p>
                                <a href="/vip" className="text-[#9a2b2b] text-xs font-bold hover:underline">去升级会员等级 →</a>
                            </div>
                          ) : (
                            <TarotChat 
                               initialHistory={chatHistory}
                               apiConfig={apiConfig}
                            />
                          )
                        )}
                    </div>

                    {/* Action */}
                    <div className="flex justify-center pt-8">
                        <button 
                            onClick={handleRestart}
                            className="btn-seal text-lg px-10 py-3 shadow-xl"
                        >
                            新的占卜
                        </button>
                    </div>

                </div>
            )}
        </div>
      </div>
    </div>
  )
}
