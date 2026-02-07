'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { getCardImage, CARD_BACK_IMAGE } from '../utils/cardImages';
import { TarotCard } from '@/types/tarot';
import { useDeck } from '@/context/DeckContext';
import { useSound } from '@/context/SoundContext';

interface CardShowcaseProps {
    card: TarotCard;
    onComplete: () => void;
}

export default function CardShowcase({ card, onComplete }: CardShowcaseProps) {
    const [phase, setPhase] = useState<'enter' | 'flip' | 'hold' | 'exit'>('enter');
    const [skip, setSkip] = useState(false);

    // Animation timers references to clear them if skipped
    const timersRef = useRef<NodeJS.Timeout[]>([]);

    const clearTimers = () => {
        timersRef.current.forEach((t) => clearTimeout(t));
        timersRef.current = [];
    };

    const handleSkip = () => {
        if (phase === 'exit' || skip) return; // Already exiting
        setSkip(true);
        clearTimers();

        // Jump straight to exit
        setPhase('hold'); // Ensure we see it briefly if super fast, or just go to exit?
        // Provide a smooth exit even on skip
        setTimeout(() => setPhase('exit'), 50);
        setTimeout(() => onComplete(), 550);
    };

    const { play } = useSound();
    useEffect(() => {
        const t1 = setTimeout(() => {
            setPhase('flip');
            play('flip');
        }, 200);
        const t2 = setTimeout(() => setPhase('hold'), 1200);
        // Hold longer for reading name
        const t3 = setTimeout(() => setPhase('exit'), 3500);
        const t4 = setTimeout(() => onComplete(), 4000);

        timersRef.current.push(t1, t2, t3, t4);

        return () => clearTimers();
    }, [onComplete, play]);

    const { currentDeck } = useDeck();
    const initialImage = getCardImage(card.id, currentDeck);
    const [imgSrc, setImgSrc] = useState(initialImage);

    useEffect(() => {
        setImgSrc(initialImage);
    }, [initialImage]);

    const handleImageError = () => {
        // Fallback logic similar to TarotCard
        if (!imgSrc.includes('/decks/rws/')) {
            const rwsUrl = getCardImage(card.id, 'rws');
            if (imgSrc !== rwsUrl) {
                setImgSrc(rwsUrl);
                return;
            }
        }
        setImgSrc(CARD_BACK_IMAGE);
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            onClick={handleSkip}
        >
            {/* Backdrop - darker for focus */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${phase === 'exit' ? 'opacity-0' : 'opacity-100'}`}
            />

            <div className="relative w-[280px] h-[480px] md:w-[320px] md:h-[560px] perspective-1000 z-10">
                <div
                    className={`
            relative w-full h-full transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform-style-3d
            ${phase === 'enter' ? 'scale-0 translate-y-[200px]' : ''}
            ${phase === 'flip' || phase === 'hold' ? 'rotate-y-180 scale-100' : ''}
            ${phase === 'exit' ? 'scale-0 translate-y-[400px] opacity-0 rotate-y-180' : ''}
          `}
                >
                    {/* Front (Card Face) - Rotated 180 initially so it shows when container flips */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl overflow-hidden shadow-2xl border-4 border-accent-main">
                        <div className="relative w-full h-full bg-white">
                            <Image
                                src={imgSrc}
                                onError={handleImageError}
                                alt={card.name}
                                fill
                                className="object-cover"
                                sizes="400px"
                                priority
                            />
                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pt-12">
                                <p className="text-white font-serif font-bold text-2xl text-center tracking-widest">
                                    {card.name}
                                </p>
                                <p className="text-white/70 text-xs text-center uppercase tracking-widest mt-1">
                                    {card.englishName}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Back (Card Back) */}
                    <div className="absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-2xl border-2 border-border">
                        <Image
                            src={CARD_BACK_IMAGE}
                            alt="Card Back"
                            fill
                            className="object-cover"
                            sizes="400px"
                            priority
                        />
                    </div>
                </div>
            </div>

            {/* Skip Hint */}
            <div
                className={`absolute bottom-20 text-white/50 text-sm tracking-widest transition-opacity duration-300 ${phase === 'exit' ? 'opacity-0' : 'opacity-100'}`}
            >
                点击屏幕跳过
            </div>

            <style jsx global>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .transform-style-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                }
                .rotate-y-180 {
                    transform: rotateY(180deg);
                }
            `}</style>
        </div>
    );
}
