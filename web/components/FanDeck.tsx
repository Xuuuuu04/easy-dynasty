'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { CARD_BACK_IMAGE } from '../utils/cardImages'

interface FanDeckProps {
  totalCards: number
  selectedCards: number[]
  onCardSelect: (cardIndex: number) => void
  disabled?: boolean
  className?: string
}

export default function FanDeck({
  totalCards,
  selectedCards,
  onCardSelect,
  disabled = false,
  className = ''
}: FanDeckProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [exitingCard, setExitingCard] = useState<number | null>(null) // 记录正在播放离场动画的卡片
  const [viewStartIndex, setViewStartIndex] = useState(0)
  
  const VISIBLE_COUNT = 15
  const SCROLL_STEP = 5 
  
  const availableCards = useMemo(() => {
    return Array.from({ length: totalCards }, (_, i) => i)
      .filter(i => !selectedCards.includes(i))
  }, [totalCards, selectedCards])

  const visibleCards = useMemo(() => {
    // 如果有正在离场的牌，也要算在 visibleCards 里，直到它真正消失
    // 这里我们简单处理：selectedCards 变化后，availableCards 会变，导致重新渲染。
    // 为了平滑动画，我们先播放动画，再回调 onCardSelect。
    return availableCards.slice(viewStartIndex, viewStartIndex + VISIBLE_COUNT)
  }, [availableCards, viewStartIndex, VISIBLE_COUNT])

  const SPREAD_ANGLE = 100
  const RADIUS = 420
  const CARD_WIDTH = 100
  const CARD_HEIGHT = 175

  useEffect(() => {
    if (viewStartIndex > availableCards.length) {
        setViewStartIndex(Math.max(0, availableCards.length - VISIBLE_COUNT));
    }
  }, [availableCards.length, viewStartIndex]);

  const getCardStyle = useCallback((index: number, total: number, originalIndex: number) => {
    const startAngle = -SPREAD_ANGLE / 2
    const actualSpread = total > 1 ? SPREAD_ANGLE : 0;
    const angleStep = total > 1 ? actualSpread / (total - 1) : 0;
    
    const angle = startAngle + (index * angleStep)
    const radians = (angle * Math.PI) / 180
    const x = Math.sin(radians) * RADIUS
    const y = -Math.cos(radians) * RADIUS + RADIUS
    
    const isHovered = hoveredCard === originalIndex
    const isExiting = exitingCard === originalIndex

    // 基础状态
    let transform = `translateX(${x}px) translateY(${y}px) rotate(${angle}deg) scale(1)`
    let opacity = 1
    let zIndex = index

    if (isExiting) {
        // 离场动画：向上飞起，放大，旋转归零，透明度降低
        transform = `translateX(${x}px) translateY(${y - 150}px) rotate(0deg) scale(1.1)`
        opacity = 0
        zIndex = 300
    } else if (isHovered) {
        // 悬停状态
        transform = `translateX(${x}px) translateY(${y - 50}px) rotate(${angle}deg) scale(1.15)`
        zIndex = 200
    }
    
    return {
      transform,
      opacity,
      zIndex,
    }
  }, [hoveredCard, exitingCard]) // Depend on exitingCard

  const handleCardClick = (originalIndex: number) => {
    if (disabled || exitingCard !== null) return // 动画进行中禁止点击其他
    
    // 1. 设置离场状态
    setExitingCard(originalIndex)
    
    // 2. 等待动画结束 (500ms 对应 transition)
    setTimeout(() => {
        onCardSelect(originalIndex) // 通知父组件移除
        setExitingCard(null) // 重置状态
        setHoveredCard(null)
    }, 450) // 稍小于 500ms 避免闪烁
  }

  const scrollLeft = () => setViewStartIndex(prev => Math.max(0, prev - SCROLL_STEP))
  const scrollRight = () => setViewStartIndex(prev => Math.min(availableCards.length - VISIBLE_COUNT, prev + SCROLL_STEP))

  const canScrollLeft = viewStartIndex > 0
  const canScrollRight = viewStartIndex + VISIBLE_COUNT < availableCards.length

  return (
    <div className={`relative ${className} select-none w-full max-w-3xl mx-auto`}>
      <div className="relative h-[380px] w-full flex items-end justify-center overflow-visible">
        
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-[#9a2b2b]/10 via-transparent to-transparent opacity-50 pointer-events-none blur-3xl" />
        
        <button
          onClick={scrollLeft}
          disabled={disabled || !canScrollLeft}
          className={`absolute left-0 md:-left-12 top-1/2 -translate-y-1/2 z-[300] w-12 h-12 rounded-full border border-[#dcd9cd] bg-[#f5f5f0]/90 flex items-center justify-center transition-all duration-300 ${
             !canScrollLeft ? 'opacity-0 pointer-events-none' : 'hover:border-[#9a2b2b] hover:text-[#9a2b2b] hover:shadow-md cursor-pointer'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        <button
          onClick={scrollRight}
          disabled={disabled || !canScrollRight}
          className={`absolute right-0 md:-right-12 top-1/2 -translate-y-1/2 z-[300] w-12 h-12 rounded-full border border-[#dcd9cd] bg-[#f5f5f0]/90 flex items-center justify-center transition-all duration-300 ${
             !canScrollRight ? 'opacity-0 pointer-events-none' : 'hover:border-[#9a2b2b] hover:text-[#9a2b2b] hover:shadow-md cursor-pointer'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
        
        <div className="relative w-full h-full">
          {visibleCards.map((originalIndex, index) => {
            const style = getCardStyle(index, visibleCards.length, originalIndex)
            const isHovered = hoveredCard === originalIndex
            const isExiting = exitingCard === originalIndex
            
            return (
              <div
                key={originalIndex}
                className="absolute bottom-10 left-1/2 cursor-pointer touch-manipulation origin-bottom"
                style={{
                  ...style,
                  marginLeft: -CARD_WIDTH / 2,
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  // Exiting 动画使用 ease-in 加速飞出，其他使用 spring
                  transition: isExiting 
                    ? 'transform 0.5s ease-in, opacity 0.5s ease-in' 
                    : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                onClick={() => handleCardClick(originalIndex)}
                onMouseEnter={() => !disabled && setHoveredCard(originalIndex)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div 
                  className={`
                    relative w-full h-full rounded-lg overflow-hidden
                    transition-all duration-300 border
                    ${isHovered 
                        ? 'border-[#9a2b2b] shadow-[0_0_20px_rgba(154,43,43,0.4)] brightness-110' 
                        : 'border-[#4a4a4a]/30 shadow-lg brightness-95 grayscale-[0.2]'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <Image
                    src={CARD_BACK_IMAGE}
                    alt="Card"
                    fill
                    className="object-cover"
                    sizes="150px"
                    draggable={false}
                    priority={index < 5} 
                  />
                  
                  <div className={`absolute inset-0 bg-[#9a2b2b] mix-blend-overlay transition-opacity duration-300 ${isHovered ? 'opacity-20' : 'opacity-0'}`} />
                  
                  <div className={`absolute top-2 right-2 transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                      <div className="w-2 h-2 bg-[#9a2b2b] rounded-full shadow-sm animate-pulse"></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            {Array.from({ length: Math.ceil(availableCards.length / SCROLL_STEP) }).slice(0, 5).map((_, i) => {
                const isActive = Math.floor(viewStartIndex / SCROLL_STEP) === i;
                return (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? 'bg-[#9a2b2b]' : 'bg-stone-300'}`} />
                )
            })}
        </div>
        
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#fffcf5]/80 backdrop-blur border border-[#dcd9cd] px-3 py-1 rounded-full shadow-sm text-[10px] text-stone-500 font-serif tracking-widest whitespace-nowrap">
            剩余 <span className="text-[#9a2b2b] font-bold text-xs mx-0.5">{availableCards.length}</span> 张
        </div>

      </div>
    </div>
  )
}
