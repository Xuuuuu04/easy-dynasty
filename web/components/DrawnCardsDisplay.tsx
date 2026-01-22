'use client';

import TarotCard from './TarotCard';
import type { DrawnCard } from '@/types/tarot';

interface DrawnCardsDisplayProps {
    drawnCards: DrawnCard[];
}

export default function DrawnCardsDisplay({ drawnCards }: DrawnCardsDisplayProps) {
    return (
        <div
            className="ink-card rounded-3xl p-6 flex flex-col lg:sticky lg:top-8 animate-slide-up bg-[#fffdf9]/85 backdrop-blur-xl border-stone-300/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)]"
            style={{ animationDelay: '0.1s' }}
        >
            <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-2 font-display">
                <span className="text-[#9a2b2b]">[-]</span> 抽到的牌
            </h2>
            <div className="flex-1 space-y-5 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
                {drawnCards.map((drawnCard, index) => (
                    <div
                        key={index}
                        className="group rounded-2xl bg-white/40 border border-stone-200/60 p-4 transition-all hover:bg-white/80 hover:border-[#9a2b2b]/30 hover:shadow-lg"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <div className="text-sm font-bold text-stone-500 uppercase tracking-wider group-hover:text-[#9a2b2b] transition-colors">
                                {drawnCard.position.name}
                            </div>
                            <div
                                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${drawnCard.isReversed
                                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                    }`}
                            >
                                {drawnCard.isReversed ? 'Reversed' : 'Upright'}
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-20 flex-shrink-0">
                                <TarotCard
                                    cardId={drawnCard.card.id}
                                    cardName={drawnCard.card.name}
                                    englishName={drawnCard.card.englishName}
                                    isReversed={drawnCard.isReversed}
                                    isRevealed={true}
                                    className="w-full shadow-md rounded-md"
                                />
                            </div>

                            <div className="flex-1">
                                <div className="mb-1 text-lg font-bold text-ink group-hover:text-[#9a2b2b] transition-colors font-display">
                                    {drawnCard.card.name}
                                </div>
                                <div className="mb-2 text-xs font-medium text-stone-500">
                                    {drawnCard.card.englishName}
                                </div>
                                <div className="mb-3 text-xs leading-relaxed text-stone-600">
                                    {drawnCard.position.description}
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {(drawnCard.isReversed
                                        ? drawnCard.card.reversedKeywords
                                        : drawnCard.card.uprightKeywords
                                    )
                                        .slice(0, 3)
                                        .map((keyword, i) => (
                                            <span
                                                key={i}
                                                className="rounded-md bg-stone-100 border border-stone-200/50 px-2 py-1 text-[10px] text-stone-600 font-serif"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
