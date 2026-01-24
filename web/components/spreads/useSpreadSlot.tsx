'use client';

import React from 'react';
import TarotCard from '../TarotCard';
import type { Position, DrawnCard } from '@/types/tarot';

export interface SpreadComponentProps {
    positions: Position[];
    drawnCards: DrawnCard[];
    onPositionClick: (positionId: number) => void;
    canDrawAtPosition: (positionId: number) => boolean;
    drawingPositionId: number | null;
    labelBg?: string;
    labelText?: string;
    labelBorder?: string;
}

interface RenderSlotOptions {
    className?: string;
    style?: React.CSSProperties;
    rotateCard?: boolean;
    labelPosition?: 'top' | 'bottom' | 'left' | 'right';
    hideLabel?: boolean;
}

export function useSpreadSlotRenderer(props: SpreadComponentProps) {
    const {
        drawnCards,
        onPositionClick,
        canDrawAtPosition,
        drawingPositionId,
        labelBg,
        labelText,
        labelBorder,
    } = props;

    const getCardAtPosition = (positionId: number): DrawnCard | null => {
        return drawnCards.find((card) => card.position.id === positionId) || null;
    };

    const renderSlot = (position: Position, options: RenderSlotOptions = {}) => {
        const {
            className = '',
            style = {},
            rotateCard = false,
            labelPosition = 'top',
            hideLabel = false,
        } = options;

        const drawnCard = getCardAtPosition(position.id);
        const canDraw = canDrawAtPosition(position.id);
        const isCurrentlyDrawing = drawingPositionId === position.id;

        const labelClasses = {
            top: '-top-10 md:-top-12 left-1/2 -translate-x-1/2 flex-col-reverse',
            bottom: 'top-[105%] left-1/2 -translate-x-1/2 flex-col',
            left: 'right-[105%] top-1/2 -translate-y-1/2 flex-row-reverse pr-2',
            right: 'left-[105%] top-1/2 -translate-y-1/2 flex-row pl-2',
        };

        const currentLabelClass = labelClasses[labelPosition] || labelClasses.top;

        return (
            <div
                key={position.id}
                className={`relative flex flex-col items-center group ${className}`}
                style={style}
            >
                {/* Label Container */}
                <div
                    className={`
            absolute z-30 transition-all duration-300 pointer-events-none w-max
            flex items-center justify-center
            ${currentLabelClass}
            ${drawnCard ? 'opacity-100' : 'opacity-80'}
            ${hideLabel ? 'hidden' : ''}
        `}
                >
                    <div
                        className="inline-flex items-center gap-1.5 rounded-sm border-2 backdrop-blur-md px-2 md:px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap"
                        style={{
                            backgroundColor: labelBg || 'rgba(255, 255, 255, 0.95)',
                            borderColor: labelBorder || 'rgba(154, 43, 43, 0.4)',
                            color: labelText || '#9a2b2b',
                            boxShadow: `0 2px 8px rgba(0, 0, 0, 0.15), 0 0 0 1px ${labelBorder || 'rgba(154, 43, 43, 0.2)'}`,
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
                            : !drawnCard
                                ? 'border-stone-300 bg-stone-100/30'
                                : ''
                        }
            ${isCurrentlyDrawing ? 'border-[#9a2b2b] animate-pulse shadow-md' : ''}
            ${drawnCard ? 'shadow-2xl' : ''}
          `}
                    onClick={() => canDraw && onPositionClick(position.id)}
                >
                    {drawnCard ? (
                        <div
                            className={`w-full h-full animate-fade-in-up relative z-10 ${rotateCard ? 'rotate-0' : ''}`}
                        >
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
                        <div
                            className={`text-center p-2 opacity-60 transition-opacity ${canDraw ? 'group-hover:opacity-100' : ''}`}
                        >
                            <span
                                className={`text-[10px] md:text-xs text-stone-400 font-serif block mb-1 ${rotateCard ? '-rotate-90' : ''}`}
                            >
                                {isCurrentlyDrawing
                                    ? 'Drawing...'
                                    : canDraw
                                        ? 'Place Card'
                                        : 'Wait'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Helper Description */}
                {!drawnCard && (
                    <div
                        className={`
              absolute z-20 w-32 md:w-40 text-center pointer-events-none
              transition-opacity duration-300
              ${labelPosition === 'bottom' ? 'top-[130%]' : 'top-[105%]'}
            `}
                    >
                        <p className="text-[9px] md:text-[10px] text-stone-400 leading-tight bg-white/80 p-1 rounded backdrop-blur-sm shadow-sm border border-stone-100">
                            {position.description}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return { renderSlot };
}
