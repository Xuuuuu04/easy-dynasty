import FlipCard from './FlipCard'

interface Position {
  id: number
  name: string
  description: string
}

interface DrawnCard {
  card: {
    id: string | number
    name: string
    englishName: string
  }
  isReversed: boolean
  position: Position
}

interface SpreadLayoutProps {
  spreadId: string
  positions: Position[]
  drawnCards: DrawnCard[]
  onPositionClick: (positionId: number) => void
  canDrawAtPosition: (positionId: number) => boolean
  isDrawing: boolean
  drawingPositionId: number | null
}

export default function SpreadLayout({
  spreadId,
  positions,
  drawnCards,
  onPositionClick,
  canDrawAtPosition,
  drawingPositionId
}: SpreadLayoutProps) {
  const getCardAtPosition = (positionId: number): DrawnCard | null => {
    return drawnCards.find(card => card.position.id === positionId) || null
  }

  const renderPosition = (position: Position, className: string = '') => {
    const drawnCard = getCardAtPosition(position.id)
    const canDraw = canDrawAtPosition(position.id)
    const isCurrentlyDrawing = drawingPositionId === position.id

    return (
      <div
        key={position.id}
        className={`group relative flex flex-col items-center pt-14 ${className}`}
      >
        {/* 位置标签 */}
        <div className="absolute top-0 left-1/2 z-10 -translate-x-1/2">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200/40 bg-purple-500/25 px-4 py-1 text-[11px] uppercase tracking-[0.3em] text-purple-100 shadow-[0_12px_35px_rgba(124,58,237,0.45)] backdrop-blur">
            <span className="text-xs">✦</span>
            {position.name}
          </div>
        </div>

        {/* 卡牌位置 */}
        <div
          className={`relative flex h-48 w-32 items-center justify-center rounded-2xl border border-dashed border-purple-300/40 bg-black/30 transition-all duration-300 ${
            canDraw
              ? 'cursor-pointer hover:border-purple-200/70 hover:shadow-[0_18px_45px_rgba(124,58,237,0.35)] hover:bg-purple-500/10'
              : 'opacity-90'
          } ${
            isCurrentlyDrawing
              ? 'border-purple-200/80 bg-purple-500/20 shadow-[0_0_25px_rgba(168,85,247,0.6)]'
              : ''
          }`}
          onClick={() => canDraw && onPositionClick(position.id)}
        >
          <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-70">
            <div className="animate-mystical-gradient h-full w-full rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(192,132,252,0.22),transparent_65%)]" />
          </div>

          {drawnCard ? (
            <FlipCard
              cardId={drawnCard.card.id}
              cardName=""
              englishName=""
              isReversed={drawnCard.isReversed}
              autoFlip={true}
              flipDelay={500}
              className="w-full h-full"
            />
          ) : (
            <div className="relative flex flex-col items-center gap-2 text-center text-sm">
              {isCurrentlyDrawing ? (
                <span className="text-purple-200">抽牌中...</span>
              ) : canDraw ? (
                <span className="text-purple-100/80">点击抽牌</span>
              ) : (
                <span className="text-slate-300/70">等待</span>
              )}
              <span className="w-24 text-[11px] leading-relaxed text-slate-300/70">
                {position.description}
              </span>
            </div>
          )}
        </div>

        {drawnCard && (
          <div className="mt-6 w-36 text-center">
            <div className="text-sm font-semibold text-white">
              {drawnCard.card.name}
            </div>
            <div className="text-xs text-purple-200/70">
              {drawnCard.card.englishName}
            </div>
          </div>
        )}

        {!drawnCard && (
          <div className="mt-4 w-32 text-center text-[11px] leading-relaxed text-slate-300/70">
            {position.description}
          </div>
        )}
      </div>
    )
  }

  // 根据不同牌阵返回不同布局
  switch (spreadId) {
    case 'single_card':
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          {renderPosition(positions[0])}
        </div>
      )

    case 'three_card_time':
    case 'three_card_mind_body_spirit':
      return (
        <div className="flex justify-center items-center gap-12 min-h-[400px]">
          {positions.map((position, index) => 
            renderPosition(position, index === 1 ? 'mt-6' : '')
          )}
        </div>
      )

    case 'celtic_cross':
      return (
        <div className="min-h-[900px] max-w-7xl mx-auto px-4 py-8">
          {/* 重新设计的凯尔特十字：每张牌都有独立空间，增大间距 */}
          <div className="grid grid-cols-7 gap-10 max-w-6xl mx-auto">
            
            {/* 第一行：上方牌 */}
            <div className="col-start-4 col-span-1 flex justify-center">
              {renderPosition(positions[4])} {/* 可能的未来 */}
            </div>
            
            {/* 第二行：左侧牌 + 挑战牌 + 中心牌 + 近期未来牌 */}
            <div className="col-start-2 col-span-1 flex justify-center">
              {renderPosition(positions[3])} {/* 过去影响 */}
            </div>
            
            <div className="col-start-3 col-span-1 flex justify-center">
              {renderPosition(positions[1])} {/* 挑战/障碍 */}
            </div>
            
            <div className="col-start-4 col-span-1 flex justify-center">
              {renderPosition(positions[0])} {/* 现状 */}
            </div>
            
            <div className="col-start-5 col-span-1 flex justify-center">
              {renderPosition(positions[5])} {/* 近期未来 */}
            </div>
            
            {/* 第三行：下方牌 */}
            <div className="col-start-4 col-span-1 flex justify-center">
              {renderPosition(positions[2])} {/* 基础/根源 */}
            </div>
            
            {/* 右侧竖列 - 增大间距 */}
            <div className="col-start-7 row-start-1 row-span-4 flex flex-col justify-center gap-12 ml-8">
              {renderPosition(positions[6])} {/* 你的态度 */}
              {renderPosition(positions[7])} {/* 外部影响 */}
              {renderPosition(positions[8])} {/* 希望与恐惧 */}
              {renderPosition(positions[9])} {/* 最终结果 */}
            </div>
            
          </div>
        </div>
      )

    default:
      return (
        <div className="grid grid-cols-3 gap-8 justify-items-center min-h-[300px]">
          {positions.map((position) => renderPosition(position))}
        </div>
      )
  }
}
