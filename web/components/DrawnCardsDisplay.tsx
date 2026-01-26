'use client';

import TarotCard from './TarotCard';
import type { DrawnCard } from '@/types/tarot';

interface DrawnCardsDisplayProps {
    drawnCards: DrawnCard[];
}

export default function DrawnCardsDisplay({ drawnCards }: DrawnCardsDisplayProps) {
    return (
        <div
            className="ink-card rounded-3xl p-6 flex flex-col lg:sticky lg:top-8 animate-slide-up bg-[#fffdf9]/85 dark:bg-slate-900/60 backdrop-blur-xl border-stone-300/60 dark:border-slate-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            style={{ animationDelay: '0.1s' }}
        >
            <h2 className="text-xl font-bold text-[var(--text-main)] mb-6 flex items-center gap-2 font-display">
                <span className="text-[var(--accent-main)]">[-]</span> 抽到的牌
            </h2>
            <div className="flex-1 space-y-5 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
                {drawnCards.map((drawnCard, index) => (
                    <div
                        key={index}
                        className="group rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-stone-200/60 dark:border-slate-700/60 p-4 transition-all hover:bg-white/80 dark:hover:bg-slate-800/80 hover:border-[var(--accent-main)]/30 hover:shadow-lg"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <div className="text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider group-hover:text-[var(--accent-main)] transition-colors">
                                {drawnCard.position.name}
                            </div>
                            <div
                                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${drawnCard.isReversed
                                        ? 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
                                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
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
                                <div className="mb-1 text-lg font-bold text-[var(--text-main)] group-hover:text-[var(--accent-main)] transition-colors font-display">
                                    {drawnCard.card.name}
                                </div>
                                <div className="mb-2 text-xs font-medium text-stone-500 dark:text-stone-400">
                                    {drawnCard.card.englishName}
                                </div>
                                <div className="mb-3 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
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
                                                className="rounded-md bg-stone-100 dark:bg-slate-700/50 border border-stone-200/50 dark:border-slate-600/50 px-2 py-1 text-[10px] text-stone-600 dark:text-stone-300 font-serif"
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
