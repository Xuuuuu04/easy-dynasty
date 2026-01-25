import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { CARD_BACK_IMAGE } from '../utils/cardImages';
import { useSound } from '@/context/SoundContext';

interface FanDeckProps {
    totalCards: number;
    selectedCards: number[];
    onCardSelect: (cardIndex: number) => void;
    disabled?: boolean;
    className?: string;
}

export default function FanDeck({
    totalCards,
    selectedCards,
    onCardSelect,
    disabled = false,
    className = '',
}: FanDeckProps) {
    const { play } = useSound();
    // Derived state: Available cards count for display
    const availableCount = totalCards - selectedCards.length;
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isInitialScroll = useRef(true);

    // Scroll to middle on mount
    useEffect(() => {
        if (scrollContainerRef.current && isInitialScroll.current) {
            const container = scrollContainerRef.current;
            const scrollWidth = container.scrollWidth;
            const clientWidth = container.clientWidth;
            container.scrollLeft = (scrollWidth - clientWidth) / 2;
            isInitialScroll.current = false;
        }
    }, []);

    return (
        <div className={`relative w-full flex flex-col items-center ${className}`}>
            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                className="w-full overflow-x-auto flex items-center px-8 md:px-[15vw] py-12 pb-16 snap-x snap-mandatory scroll-smooth no-scrollbar"
                style={{ scrollBehavior: 'smooth' }}
            >
                {Array.from({ length: totalCards }).map((_, i) => {
                    if (selectedCards.includes(i)) return null;

                    return (
                        <div
                            key={i}
                            className="flex-shrink-0 relative w-[100px] h-[175px] md:w-[120px] md:h-[210px] snap-center -ml-8 md:-ml-16 first:ml-0 transition-all duration-300 transform hover:-translate-y-8 hover:scale-110 hover:z-50 hover:mr-8 cursor-pointer group"
                            style={{ zIndex: 1 }}
                            onMouseEnter={() => !disabled && play('hover')}
                            onClick={() => {
                                if (!disabled) {
                                    play('draw');
                                    onCardSelect(i);
                                }
                            }}
                        >
                            <div className="relative w-full h-full rounded-lg overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.3)] border border-border group-hover:border-accent-main group-hover:shadow-[0_0_25px_rgba(var(--accent-main-rgb),0.6)] transition-all bg-card-bg">
                                <Image
                                    src={CARD_BACK_IMAGE}
                                    alt="Card"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100px, 120px"
                                    quality={85}
                                    loading="lazy"
                                    draggable={false}
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Counter */}
            <div className="mt-4 pointer-events-none text-text-muted font-serif text-xs tracking-widest bg-bg-main/50 px-4 py-1 rounded-full backdrop-blur-sm border border-border">
                滑动抽牌 · 剩余 {availableCount} 张
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
