'use client';

import { useState, useEffect } from 'react';
import TarotCard from './TarotCard';

interface FlipCardProps {
    cardId?: string | number;
    cardName?: string;
    englishName?: string;
    isReversed?: boolean;
    className?: string;
    onFlipComplete?: () => void;
    autoFlip?: boolean;
    flipDelay?: number;
    initialFlipped?: boolean;
}

export default function FlipCard({
    cardId,
    cardName,
    englishName,
    isReversed = false,
    className = '',
    onFlipComplete,
    autoFlip = false,
    flipDelay = 1000,
    initialFlipped = false,
}: FlipCardProps) {
    const [isFlipped, setIsFlipped] = useState(initialFlipped);
    const [showAnimation, setShowAnimation] = useState(false);

    useEffect(() => {
        if (autoFlip) {
            const timer = setTimeout(() => {
                setShowAnimation(true);
                setTimeout(() => {
                    setIsFlipped(true);
                    onFlipComplete?.();
                }, 400); // 翻牌动画持续时间的一半
            }, flipDelay);

            return () => clearTimeout(timer);
        }
    }, [autoFlip, flipDelay, onFlipComplete]);

    const handleClick = () => {
        if (!autoFlip && !isFlipped) {
            setShowAnimation(true);
            setTimeout(() => {
                setIsFlipped(true);
                onFlipComplete?.();
            }, 400);
        }
    };

    return (
        <div
            className={`group relative ${className}`}
            style={{ perspective: '1200px' }}
            onClick={handleClick}
        >
            <div
                className={`relative w-full h-full transition-all duration-800 cubic-bezier(0.175, 0.885, 0.32, 1.275) ${
                    !autoFlip && !isFlipped ? 'cursor-pointer hover:scale-105 hover:-translate-y-2' : ''
                }`}
                style={{
                    transformStyle: 'preserve-3d',
                    transform: showAnimation
                        ? isFlipped
                            ? 'rotateY(180deg)'
                            : 'rotateY(0deg)'
                        : 'rotateY(0deg)',
                    boxShadow: isFlipped 
                        ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
                        : '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                }}
            >
                {/* 牌背面 */}
                <div
                    className={`absolute inset-0 ${isFlipped ? 'invisible' : 'visible'}`}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <TarotCard showCardBack={true} className="w-full h-full rounded-xl border border-white/10" />
                    {/* 背面悬浮光效 */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-accent-main/20 to-transparent"></div>
                </div>

                {/* 牌正面 */}
                <div
                    className={`absolute inset-0 ${isFlipped ? 'visible' : 'invisible'}`}
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                    }}
                >
                    <TarotCard
                        cardId={cardId}
                        cardName={cardName}
                        englishName={englishName}
                        isReversed={isReversed}
                        isRevealed={true}
                        className="w-full h-full rounded-xl border border-accent-main/30"
                    />
                    {/* 正面流光特效 */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shimmer"></div>
                    </div>
                </div>
            </div>

            {/* 粒子爆发特效 - 仅在翻牌瞬间显示 */}
            {showAnimation && !isFlipped && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-full h-full">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1.5 h-1.5 bg-accent-main rounded-full animate-particle-explosion"
                                style={{
                                    transform: `rotate(${i * 30}deg) translateY(-60px)`,
                                    opacity: 0,
                                }}
                            ></div>
                        ))}
                    </div>
                </div>
            )}

            {/* 翻牌提示 */}
            {!autoFlip && !isFlipped && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/40 backdrop-blur-sm border border-white/20 text-white/90 text-[10px] px-3 py-1.5 rounded-full opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110 font-medium tracking-widest uppercase shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                        点击翻牌
                    </div>
                </div>
            )}
        </div>
    );
}
