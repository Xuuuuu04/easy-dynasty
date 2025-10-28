import Image from 'next/image'
import { getCardImage, CARD_BACK_IMAGE } from '../utils/cardImages'

interface TarotCardProps {
  cardId?: string | number
  cardName?: string
  englishName?: string
  isReversed?: boolean
  isRevealed?: boolean
  className?: string
  onClick?: () => void
  showCardBack?: boolean
}

export default function TarotCard({
  cardId,
  cardName,
  englishName,
  isReversed = false,
  isRevealed = true,
  className = '',
  onClick,
  showCardBack = false
}: TarotCardProps) {
  const imageUrl = showCardBack || !isRevealed ? CARD_BACK_IMAGE : getCardImage(cardId ?? '')
  
  return (
    <div 
      className={`group relative transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-[1.06]' : ''} ${className}`}
      onClick={onClick}
    >
      <div className={`relative ${isReversed && isRevealed ? 'transform rotate-180' : ''}`}>
        {/* 固定尺寸的图片容器 */}
        <div className="relative w-full aspect-[2/3.5] overflow-hidden rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.5)] border border-white/20 bg-gray-800 transition-shadow duration-300 group-hover:shadow-[0_15px_45px_rgba(124,58,237,0.4)]">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none z-10" />
          <Image
            src={imageUrl}
            alt={isRevealed ? `${cardName} - ${englishName}` : '塔罗牌背面'}
            fill
            className="object-cover"
            priority={false}
            sizes="(max-width: 768px) 150px, 200px"
          />
        </div>
        
        {/* 逆位指示器 */}
        {isReversed && isRevealed && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-2.5 py-1 rounded-full transform rotate-180 z-20 font-semibold shadow-[0_5px_20px_rgba(245,158,11,0.4)]">
            逆位
          </div>
        )}
        
        {/* 正位指示器 */}
        {!isReversed && isRevealed && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] px-2.5 py-1 rounded-full z-20 font-semibold shadow-[0_5px_20px_rgba(16,185,129,0.4)]">
            正位
          </div>
        )}
      </div>
      
      {/* 卡牌信息 */}
      {isRevealed && cardName && (
        <div className="mt-3 text-center">
          <div className="text-white font-semibold text-sm mb-0.5">{cardName}</div>
          {englishName && (
            <div className="text-purple-200/70 text-xs">{englishName}</div>
          )}
        </div>
      )}
    </div>
  )
}
