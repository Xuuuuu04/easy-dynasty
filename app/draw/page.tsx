'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import tarotCardsData from '../../data/tarot-cards.json'
import spreadsData from '../../data/spreads.json'
import SpreadLayout from '../../components/SpreadLayout'

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

export default function DrawPage() {
  const [question, setQuestion] = useState('')
  const [spread, setSpread] = useState<Spread | null>(null)
  const [, setAllCards] = useState<TarotCard[]>([])
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [shuffledDeck, setShuffledDeck] = useState<TarotCard[]>([])
  const [drawingPositionId, setDrawingPositionId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    // 从 sessionStorage 获取问题和牌阵
    const savedQuestion = sessionStorage.getItem('tarot_question')
    const savedSpreadId = sessionStorage.getItem('tarot_spread')
    
    if (!savedQuestion || !savedSpreadId) {
      router.push('/')
      return
    }

    // 使用 setTimeout 避免同步 setState
    setTimeout(() => {
      setQuestion(savedQuestion)
      
      // 找到对应的牌阵
      const selectedSpread = spreadsData.spreads.find(s => s.id === savedSpreadId)
      if (!selectedSpread) {
        router.push('/')
        return
      }
      setSpread(selectedSpread)

      // 准备所有塔罗牌数据
      const cards: TarotCard[] = []
      
      // 添加大阿尔卡那
      tarotCardsData.majorArcana.forEach(card => {
        cards.push({
          id: card.id,
          name: card.name,
          englishName: card.englishName,
          suit: card.suit,
          uprightKeywords: card.uprightKeywords,
          reversedKeywords: card.reversedKeywords
        })
      })

      // 添加小阿尔卡那
      Object.entries(tarotCardsData.minorArcana).forEach(([, suitCards]) => {
        suitCards.forEach(card => {
          cards.push({
            id: card.id,
            name: card.name,
            englishName: card.englishName,
            suit: card.suit,
            uprightKeywords: card.uprightKeywords,
            reversedKeywords: card.reversedKeywords
          })
        })
      })

      setAllCards(cards)
      
      // 洗牌 - Fisher-Yates 算法
      const shuffled = [...cards]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      setShuffledDeck(shuffled)
    }, 0)
  }, [router])

  const drawCardAtPosition = (positionId: number) => {
    if (!spread || isDrawing || currentCardIndex >= spread.cardCount) return
    
    // 检查该位置是否已经抽过牌
    const alreadyDrawn = drawnCards.some(card => card.position.id === positionId)
    if (alreadyDrawn) return

    setIsDrawing(true)
    setDrawingPositionId(positionId)

    // 模拟抽牌动画延迟
    setTimeout(() => {
      const card = shuffledDeck[currentCardIndex]
      const isReversed = Math.random() < 0.5 // 50% 概率逆位
      const position = spread.positions.find(p => p.id === positionId)!

      const drawnCard: DrawnCard = {
        card,
        isReversed,
        position
      }

      setDrawnCards(prev => [...prev, drawnCard])
      setCurrentCardIndex(prev => prev + 1)
      setIsDrawing(false)
      setDrawingPositionId(null)
    }, 1000)
  }

  // 获取指定位置的已抽牌
  const getCardAtPosition = (positionId: number): DrawnCard | null => {
    return drawnCards.find(card => card.position.id === positionId) || null
  }

  // 检查位置是否可以抽牌
  const canDrawAtPosition = (positionId: number): boolean => {
    return !getCardAtPosition(positionId) && !isDrawing
  }

  const handleAnalyze = () => {
    // 保存抽牌结果到 sessionStorage
    sessionStorage.setItem('tarot_drawn_cards', JSON.stringify(drawnCards))
    router.push('/analysis')
  }

  if (!spread) {
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
            正在准备牌阵...
          </div>
        </div>
      </div>
    )
  }

  const isComplete = drawnCards.length === spread.cardCount

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050311] text-slate-100">
      <div className="stars-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.28),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(56,189,248,0.18),transparent_60%)]" />
      <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-purple-500/25 blur-[140px] animate-mystical-gradient" />
      <div className="absolute bottom-[-180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-[180px] animate-mystical-gradient" />

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10 space-y-4">
              <div className="inline-flex items-center justify-center gap-3">
                <span className="text-4xl">🔮</span>
                <h1 className="text-3xl md:text-4xl font-semibold font-[var(--font-display)] text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-violet-200 to-pink-200 drop-shadow-[0_10px_40px_rgba(124,58,237,0.45)]">
                  神秘抽牌
                </h1>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl shadow-[0_20px_60px_rgba(76,29,149,0.35)] max-w-3xl mx-auto">
                <p className="text-slate-200/90 text-sm mb-2">
                  <span className="text-purple-200 font-medium">您的问题：</span>
                  {question}
                </p>
                <p className="text-purple-200/80 text-sm">
                  <span className="text-pink-200 font-medium">牌阵：</span>
                  {spread.name} ({spread.cardCount} 张牌)
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-10 max-w-2xl mx-auto">
              <div className="flex justify-center items-center mb-4 gap-3">
                <span className="text-purple-200/80 text-sm font-medium uppercase tracking-wider">进度</span>
                <div className="text-white text-xl font-semibold font-[var(--font-display)]">
                  {drawnCards.length} <span className="text-purple-300/60">/</span> {spread.cardCount}
                </div>
              </div>
              <div className="relative w-full h-3 bg-black/30 rounded-full overflow-hidden border border-white/10 shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-amber-400/20" />
                <div
                  className="relative h-full rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all duration-700 ease-out"
                  style={{ width: `${(drawnCards.length / spread.cardCount) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>

            {/* 抽牌指引 */}
            {!isComplete && (
              <div className="text-center mb-10">
                <div className="inline-flex flex-col gap-2 rounded-2xl border border-purple-300/30 bg-purple-500/10 px-8 py-4 shadow-[0_20px_50px_rgba(168,85,247,0.3)] backdrop-blur">
                  <div className="text-lg font-medium text-white font-[var(--font-display)]">
                    {isDrawing ? '✨ 正在抽牌...' : '💫 点击下方位置进行抽牌'}
                  </div>
                  <p className="text-purple-100/80 text-sm">
                    请按照牌阵布局，点击相应位置抽取塔罗牌
                  </p>
                </div>
              </div>
            )}

            {/* 牌阵布局 */}
            <div className="mb-10">
              <SpreadLayout
                spreadId={spread.id}
                positions={spread.positions}
                drawnCards={drawnCards}
                onPositionClick={drawCardAtPosition}
                canDrawAtPosition={canDrawAtPosition}
                isDrawing={isDrawing}
                drawingPositionId={drawingPositionId}
              />
            </div>

            {/* Complete Button */}
            {isComplete && (
              <div className="text-center animate-float">
                <button
                  onClick={handleAnalyze}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 px-10 py-4 text-lg font-semibold text-white shadow-[0_25px_65px_rgba(232,121,249,0.55)] transition-all duration-300 hover:scale-[1.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                >
                  <span className="text-xl">✨</span>
                  开始分析
                </button>
              </div>
            )}

            {/* Back Button */}
            <div className="text-center mt-10">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                <span>←</span>
                返回首页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
