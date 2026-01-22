'use client'

import React from 'react'
import TarotCard from './TarotCard'
import type { Position, DrawnCard } from '@/types/tarot'

interface SpreadLayoutProps {
  spreadId: string
  positions: Position[]
  drawnCards: DrawnCard[]
  onPositionClick: (positionId: number) => void
  canDrawAtPosition: (positionId: number) => boolean
  isDrawing: boolean
  drawingPositionId: number | null
  labelBg?: string  // Optional background color for labels
  labelText?: string  // Optional text color for labels
  labelBorder?: string  // Optional border color for labels
}

export default function SpreadLayout({
  spreadId,
  positions,
  drawnCards,
  onPositionClick,
  canDrawAtPosition,
  drawingPositionId,
  labelBg,
  labelText,
  labelBorder
}: SpreadLayoutProps) {

  const getCardAtPosition = (positionId: number): DrawnCard | null => {
    return drawnCards.find(card => card.position.id === positionId) || null
  }

  // --- Render Single Slot ---
  interface RenderSlotOptions {
    className?: string;
    style?: React.CSSProperties;
    rotateCard?: boolean; // If true, rotates the CARD 90deg, but keeps label upright
    labelPosition?: 'top' | 'bottom' | 'left' | 'right'; // Custom label position
    hideLabel?: boolean;
  }

  const renderSlot = (position: Position, options: RenderSlotOptions = {}) => {
    const {
      className = '',
      style = {},
      rotateCard = false,
      labelPosition = 'top',
      hideLabel = false
    } = options

    const drawnCard = getCardAtPosition(position.id)
    const canDraw = canDrawAtPosition(position.id)
    const isCurrentlyDrawing = drawingPositionId === position.id

    // Position classes for Label
    const labelClasses = {
      top: '-top-10 md:-top-12 left-1/2 -translate-x-1/2 flex-col-reverse',
      bottom: 'top-[105%] left-1/2 -translate-x-1/2 flex-col',
      left: 'right-[105%] top-1/2 -translate-y-1/2 flex-row-reverse pr-2',
      right: 'left-[105%] top-1/2 -translate-y-1/2 flex-row pl-2',
    }

    const currentLabelClass = labelClasses[labelPosition] || labelClasses.top

    return (
      <div
        key={position.id}
        className={`relative flex flex-col items-center group ${className}`}
        style={style}
      >
        {/* Label Container */}
        <div className={`
            absolute z-30 transition-all duration-300 pointer-events-none w-max
            flex items-center justify-center
            ${currentLabelClass}
            ${drawnCard ? 'opacity-100' : 'opacity-80'}
            ${hideLabel ? 'hidden' : ''}
        `}>
          <div
            className="inline-flex items-center gap-1.5 rounded-sm border-2 backdrop-blur-md px-2 md:px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap"
            style={{
              backgroundColor: labelBg || 'rgba(255, 255, 255, 0.95)',
              borderColor: labelBorder || 'rgba(154, 43, 43, 0.4)',
              color: labelText || '#9a2b2b',
              boxShadow: `0 2px 8px rgba(0, 0, 0, 0.15), 0 0 0 1px ${labelBorder || 'rgba(154, 43, 43, 0.2)'}`
            }}
          >
            <span>{position.name}</span>
          </div>
        </div>

        {/* Card Area */}
        <div
          className={`
            relative w-[100px] h-[175px] md:w-[140px] md:h-[245px] 
            transition-all duration-500 ease-out
            flex items-center justify-center
            ${rotateCard ? 'rotate-90' : ''}
            ${!drawnCard ? 'rounded-lg border-2 border-dashed' : ''}
            ${canDraw && !drawnCard
              ? 'cursor-pointer border-[#9a2b2b]/50 bg-[#9a2b2b]/5 hover:border-[#9a2b2b] hover:shadow-[0_0_15px_rgba(154,43,43,0.2)]'
              : !drawnCard ? 'border-stone-300 bg-stone-100/30' : ''
            }
            ${isCurrentlyDrawing ? 'border-[#9a2b2b] animate-pulse shadow-md' : ''}
            ${drawnCard ? 'shadow-2xl' : ''}
          `}
          onClick={() => canDraw && onPositionClick(position.id)}
        >
          {drawnCard ? (
            <div className={`w-full h-full animate-fade-in-up relative z-10 ${rotateCard ? 'rotate-0' : ''}`}>
              <TarotCard
                cardId={drawnCard.card.id}
                cardName={drawnCard.card.name}
                englishName={drawnCard.card.englishName}
                isReversed={drawnCard.isReversed}
                isRevealed={true}
                className="w-full h-full shadow-md rounded-lg overflow-hidden"
                showCardBack={false}
              />
            </div>
          ) : (
            // Empty State
            <div className={`text-center p-2 opacity-60 transition-opacity ${canDraw ? 'group-hover:opacity-100' : ''}`}>
              <span className={`text-[10px] md:text-xs text-stone-400 font-serif block mb-1 ${rotateCard ? '-rotate-90' : ''}`}>
                {isCurrentlyDrawing ? 'Drawing...' : canDraw ? 'Place Card' : 'Wait'}
              </span>
            </div>
          )}
        </div>

        {/* Helper Description - Only show if NO card drawn */}
        {!drawnCard && (
          <div className={`
              absolute z-20 w-32 md:w-40 text-center pointer-events-none
              transition-opacity duration-300
              ${labelPosition === 'bottom' ? 'top-[130%]' : 'top-[105%]'}
            `}>
            <p className="text-[9px] md:text-[10px] text-stone-400 leading-tight bg-white/80 p-1 rounded backdrop-blur-sm shadow-sm border border-stone-100">
              {position.description}
            </p>
          </div>
        )}
      </div>
    )
  }


  // --- Layout Renderers ---

  // 1. Single Card
  if (spreadId === 'single_card') {
    return (
      <div className="flex items-center justify-center min-h-[40vh] py-12">
        {renderSlot(positions[0], { className: 'scale-110 md:scale-125' })}
      </div>
    )
  }

  // 2. Three Card (Horizontal)
  if (spreadId.startsWith('three_card')) {
    return (
      <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16 py-12">
        {positions.map((p, i) => (
          <div key={p.id} className={i === 1 ? 'md:-mt-12' : ''}>
            {renderSlot(p)}
          </div>
        ))}
      </div>
    )
  }

  // 3. Four Card (Diamond / Core)
  if (spreadId === 'four_card_spread') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-16 items-center justify-items-center">
          <div className="col-span-2 md:col-span-3 order-1">{renderSlot(positions[0])}</div>
          <div className="order-2 md:order-2">{renderSlot(positions[1])}</div>
          <div className="order-3 md:order-3 md:col-start-3">{renderSlot(positions[3])}</div>
          <div className="col-span-2 md:col-span-3 order-4 md:order-4">{renderSlot(positions[2])}</div>
        </div>
      </div>
    )
  }

  // 4. Five Card (Choice / Relationship)
  if (spreadId === 'five_card_spread') {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="relative w-full max-w-4xl flex flex-wrap justify-center gap-8 md:gap-12">
          <div className="flex flex-col gap-16 mt-16">
            {renderSlot(positions[0], { labelPosition: 'left' })}
            {renderSlot(positions[2], { labelPosition: 'left' })}
          </div>

          <div className="z-10 -mt-12 md:-mt-20">
            {renderSlot(positions[1], { className: 'scale-110' })}
          </div>

          <div className="flex flex-col gap-16 mt-16">
            {renderSlot(positions[3], { labelPosition: 'right' })}
            {renderSlot(positions[4], { labelPosition: 'right' })}
          </div>
        </div>
      </div>
    )
  }

  // 5. Celtic Cross
  if (spreadId === 'celtic_cross') {
    return (
      <div className="w-full max-w-7xl mx-auto px-2 md:px-8 py-8 md:py-16 overflow-x-auto min-h-[800px]">
        <div className="min-w-[700px] md:min-w-[900px] flex justify-center gap-20 md:gap-32">

          {/* Left Section: The Cross (6 cards) */}
          <div className="relative w-[400px] md:w-[500px] h-[600px] md:h-[700px]">

            {/* Center Group (1 & 2) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="relative w-[100px] md:w-[140px] flex justify-center">
                {/* 1. Present - Base */}
                <div className="absolute top-0 left-0 z-10 transition-transform hover:z-40 hover:scale-105 duration-300">
                  {renderSlot(positions[0], { labelPosition: 'top' })}
                </div>

                {/* 2. Challenge - Horizontal over top */}
                <div className="absolute top-0 left-0 z-30 pointer-events-none flex items-center justify-center w-full h-full hover:z-50 transition-all duration-300">
                  <div className="translate-y-8 md:translate-y-12 pointer-events-auto hover:scale-105 transition-transform">
                    {renderSlot(positions[1], {
                      rotateCard: true,
                      labelPosition: 'bottom',
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Surrounding Cards */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              {renderSlot(positions[2])}
            </div>

            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              {renderSlot(positions[3], { labelPosition: 'left' })}
            </div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2">
              {renderSlot(positions[4])}
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              {renderSlot(positions[5], { labelPosition: 'right' })}
            </div>
          </div>

          {/* Right Section: The Staff (4 cards) */}
          <div className="flex flex-col gap-6 md:gap-10 justify-center h-full pt-12 md:pt-0">
            <div className="scale-90 md:scale-100">{renderSlot(positions[9], { labelPosition: 'right' })}</div>
            <div className="scale-90 md:scale-100">{renderSlot(positions[8], { labelPosition: 'right' })}</div>
            <div className="scale-90 md:scale-100">{renderSlot(positions[7], { labelPosition: 'right' })}</div>
            <div className="scale-90 md:scale-100">{renderSlot(positions[6], { labelPosition: 'right' })}</div>
          </div>

        </div>
      </div>
    )
  }

  // 6. Two Choices (Y-shaped comparison)
  if (spreadId === 'two_choices') {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="relative w-full max-w-5xl flex flex-col items-center gap-16">
          {/* Current Situation - Top Center */}
          <div className="z-20">
            {renderSlot(positions[0], { className: 'scale-110' })}
          </div>

          {/* Two Paths Branching Out */}
          <div className="flex flex-col md:flex-row gap-16 md:gap-24 w-full justify-center items-start">
            {/* Option A Path */}
            <div className="flex flex-col items-center gap-12">
              <div className="text-center mb-4">
                <span className="inline-block px-4 py-2 bg-[#9a2b2b]/10 border-2 border-[#9a2b2b]/30 rounded-sm text-sm font-bold text-[#9a2b2b] tracking-widest">选项 A</span>
              </div>
              {renderSlot(positions[1])}
              {renderSlot(positions[2])}
            </div>

            {/* Option B Path */}
            <div className="flex flex-col items-center gap-12">
              <div className="text-center mb-4">
                <span className="inline-block px-4 py-2 bg-[#9a2b2b]/10 border-2 border-[#9a2b2b]/30 rounded-sm text-sm font-bold text-[#9a2b2b] tracking-widest">选项 B</span>
              </div>
              {renderSlot(positions[3])}
              {renderSlot(positions[4])}
            </div>
          </div>

          {/* Bottom Row - Common Factors */}
          <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center">
            {renderSlot(positions[5])}
            {renderSlot(positions[6], { className: 'scale-110' })}
          </div>
        </div>
      </div>
    )
  }

  // 7. Hexagram (Star-shaped)
  if (spreadId === 'hexagram') {
    return (
      <div className="flex items-center justify-center py-12 px-4 min-h-[700px]">
        <div className="relative w-full max-w-4xl h-[650px]">
          {/* Top Triangle Points */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2">
            {renderSlot(positions[0])}
          </div>
          <div className="absolute top-[20%] left-[15%]">
            {renderSlot(positions[3], { labelPosition: 'left' })}
          </div>
          <div className="absolute top-[20%] right-[15%]">
            {renderSlot(positions[4], { labelPosition: 'right' })}
          </div>

          {/* Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            {renderSlot(positions[1], { className: 'scale-110' })}
          </div>

          {/* Bottom Triangle Points */}
          <div className="absolute bottom-[20%] left-[15%]">
            {renderSlot(positions[5], { labelPosition: 'left' })}
          </div>
          <div className="absolute bottom-[20%] right-[15%]">
            {renderSlot(positions[6], { labelPosition: 'right' })}
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            {renderSlot(positions[2])}
          </div>
        </div>
      </div>
    )
  }

  // 8. Seven Card Prophecy (Fan-shaped)
  if (spreadId === 'seven_card_prophecy') {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="relative w-full max-w-5xl">
          {/* Top Row - Context */}
          <div className="flex flex-col md:flex-row gap-10 md:gap-12 justify-center items-center mb-12">
            {renderSlot(positions[0])}
            {renderSlot(positions[1])}
            {renderSlot(positions[2])}
          </div>

          {/* Middle Row - Analysis */}
          <div className="flex flex-col md:flex-row gap-10 md:gap-12 justify-center items-center mb-12">
            {renderSlot(positions[3])}
            {renderSlot(positions[4])}
          </div>

          {/* Bottom Row - Action & Result */}
          <div className="flex flex-col md:flex-row gap-10 md:gap-12 justify-center items-center">
            {renderSlot(positions[5])}
            {renderSlot(positions[6], { className: 'scale-110' })}
          </div>
        </div>
      </div>
    )
  }

  // 9. Lovers Venus (Heart-shaped)
  if (spreadId === 'lovers_venus') {
    return (
      <div className="flex items-center justify-center py-12 px-4 min-h-[750px]">
        <div className="relative w-full max-w-5xl h-[700px]">
          {/* Top Row - You & Partner */}
          <div className="absolute top-0 left-[25%] -translate-x-1/2">
            {renderSlot(positions[0], { labelPosition: 'left' })}
          </div>
          <div className="absolute top-0 right-[25%] translate-x-1/2">
            {renderSlot(positions[1], { labelPosition: 'right' })}
          </div>

          {/* Upper Middle Row */}
          <div className="absolute top-[25%] left-[10%]">
            {renderSlot(positions[2], { labelPosition: 'left' })}
          </div>
          <div className="absolute top-[25%] left-1/2 -translate-x-1/2 z-10">
            {renderSlot(positions[3], { className: 'scale-105' })}
          </div>
          <div className="absolute top-[25%] right-[10%]">
            {renderSlot(positions[4], { labelPosition: 'right' })}
          </div>

          {/* Lower Middle Row - Hearts */}
          <div className="absolute top-[55%] left-[20%]">
            {renderSlot(positions[5], { labelPosition: 'left' })}
          </div>
          <div className="absolute top-[55%] right-[20%]">
            {renderSlot(positions[6], { labelPosition: 'right' })}
          </div>

          {/* Bottom - Future */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            {renderSlot(positions[7], { className: 'scale-110' })}
          </div>
        </div>
      </div>
    )
  }

  // 10. Horseshoe (U-shaped)
  if (spreadId === 'horseshoe') {
    return (
      <div className="flex items-center justify-center py-12 px-4 min-h-[600px]">
        <div className="relative w-full max-w-5xl h-[550px]">
          {/* Left Side */}
          <div className="absolute left-[5%] top-[10%]">
            {renderSlot(positions[0], { labelPosition: 'left' })}
          </div>
          <div className="absolute left-[10%] top-[40%]">
            {renderSlot(positions[1], { labelPosition: 'left' })}
          </div>

          {/* Bottom Center */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            {renderSlot(positions[2])}
          </div>

          {/* Right Side */}
          <div className="absolute right-[10%] top-[40%]">
            {renderSlot(positions[4], { labelPosition: 'right' })}
          </div>
          <div className="absolute right-[5%] top-[10%]">
            {renderSlot(positions[5], { labelPosition: 'right' })}
          </div>

          {/* Top Center - Attitude & Result */}
          <div className="absolute top-0 left-[35%]">
            {renderSlot(positions[3])}
          </div>
          <div className="absolute top-0 right-[35%]">
            {renderSlot(positions[6], { className: 'scale-110' })}
          </div>
        </div>
      </div>
    )
  }

  // 11. Relationship Cross
  if (spreadId === 'relationship_cross') {
    return (
      <div className="flex items-center justify-center py-12 px-4 min-h-[600px]">
        <div className="relative w-full max-w-4xl h-[550px]">
          {/* Horizontal Axis - You & Partner */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            {renderSlot(positions[0], { labelPosition: 'left' })}
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            {renderSlot(positions[1], { labelPosition: 'right' })}
          </div>

          {/* Vertical Axis - Current & Foundation */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2">
            {renderSlot(positions[2])}
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            {renderSlot(positions[3])}
          </div>

          {/* Center - Challenge & Potential */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex gap-8">
              {renderSlot(positions[4], { className: 'scale-95' })}
              {renderSlot(positions[5], { className: 'scale-95' })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 12. Career Pyramid
  if (spreadId === 'career_pyramid') {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="flex flex-col items-center gap-12">
          {/* Top - Action */}
          <div className="z-10">
            {renderSlot(positions[5], { className: 'scale-110' })}
          </div>

          {/* Second Row - Opportunities & Challenges */}
          <div className="flex gap-12 md:gap-16">
            {renderSlot(positions[3])}
            {renderSlot(positions[4])}
          </div>

          {/* Third Row - Strengths & Weaknesses */}
          <div className="flex gap-12 md:gap-16">
            {renderSlot(positions[1])}
            {renderSlot(positions[2])}
          </div>

          {/* Bottom - Current State */}
          <div>
            {renderSlot(positions[0], { className: 'scale-105' })}
          </div>
        </div>
      </div>
    )
  }

  // 13. Wealth Tree
  if (spreadId === 'wealth_tree') {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="flex flex-col items-center gap-12">
          {/* Top - Harvest */}
          <div className="z-10">
            {renderSlot(positions[4], { className: 'scale-110' })}
          </div>

          {/* Middle Row - Opportunities & Obstacles */}
          <div className="flex gap-12 md:gap-20">
            {renderSlot(positions[2])}
            {renderSlot(positions[3])}
          </div>

          {/* Lower - Current State */}
          <div>
            {renderSlot(positions[1])}
          </div>

          {/* Bottom - Root/Belief */}
          <div>
            {renderSlot(positions[0], { className: 'scale-105' })}
          </div>
        </div>
      </div>
    )
  }

  // 14. Twelve Houses (Circular with center)
  if (spreadId === 'twelve_houses') {
    return (
      <div className="w-full max-w-6xl mx-auto px-2 md:px-8 py-8 md:py-16 overflow-x-auto min-h-[900px]">
        <div className="min-w-[800px] relative h-[850px] flex items-center justify-center">
          {/* Center Card - Annual Summary */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
            {renderSlot(positions[12], { className: 'scale-125' })}
          </div>

          {/* 12 Houses in Circle */}
          {/* Position calculations for circular layout */}
          {positions.slice(0, 12).map((pos, idx) => {
            const angle = (idx * 30 - 90) * (Math.PI / 180) // Start from top, 30° each
            const radius = 320 // Distance from center
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius

            return (
              <div
                key={pos.id}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                {renderSlot(pos, { className: 'scale-90' })}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return <div className="text-center p-8">Unknown Layout</div>
}
