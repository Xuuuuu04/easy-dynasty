'use client';

import { useState, useMemo, useCallback } from 'react';
import tarotCardsData from '../../data/tarot-cards.json';
import { TarotIcon } from '@/components/Icons';
import AtmosphereBackground from '@/components/AtmosphereBackground';
import CardDetailModal from '@/components/CardDetailModal';
import WikiCard from '@/components/WikiCard';

// Define explicit type for card data
interface TarotCardData {
    id: number | string;
    name: string;
    englishName: string;
    suit: string;
    uprightKeywords: string[];
    reversedKeywords: string[];
    uprightMeaning?: string;
    reversedMeaning?: string;
}

const CARDS_PER_PAGE = 20;

export default function WikiPage() {
    const [search, setSearch] = useState('');
    const [selectedCard, setSelectedCard] = useState<TarotCardData | null>(null);
    const [displayCount, setDisplayCount] = useState(CARDS_PER_PAGE);

    const allTarotCards = useMemo(() => {
        const majors = tarotCardsData.majorArcana || [];
        const minors = tarotCardsData.minorArcana || {};
        return [
            ...majors,
            ...(minors.wands || []),
            ...(minors.cups || []),
            ...(minors.swords || []),
            ...(minors.pentacles || []),
        ] as TarotCardData[];
    }, []);

    const filteredCards = useMemo(() => {
        if (!search) return allTarotCards;
        const lowerSearch = search.toLowerCase();
        return allTarotCards.filter(
            (c) => c.name.includes(search) || c.englishName.toLowerCase().includes(lowerSearch)
        );
    }, [search, allTarotCards]);

    const displayedCards = useMemo(() => {
        return filteredCards.slice(0, displayCount);
    }, [filteredCards, displayCount]);

    const handleLoadMore = useCallback(() => {
        setDisplayCount((prev) => Math.min(prev + CARDS_PER_PAGE, filteredCards.length));
    }, [filteredCards.length]);

    const handleCardClick = useCallback((card: TarotCardData) => {
        setSelectedCard(card);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedCard(null);
    }, []);

    const hasMore = displayCount < filteredCards.length;

    return (
        <div className="min-h-screen bg-[#f5f5f0] pt-24 pb-12 px-4 font-serif text-stone-800 relative overflow-hidden">
            {/* Atmosphere Background */}
            <AtmosphereBackground />

            {/* Background Texture */}
            <div
                className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20"
                style={{ backgroundImage: 'url("/rice-paper-2.png")' }}
            ></div>

            {/* Tarot Art Overlay */}
            <div
                className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.08] mix-blend-multiply transition-opacity duration-1000"
                style={{
                    backgroundImage: 'url("/tarot-art-overlay.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            ></div>

            {/* Floating Text Decor */}
            <div className="absolute top-[10%] right-[5%] pointer-events-none select-none opacity-[0.06] writing-vertical font-serif text-5xl text-[#9a2b2b] animate-float">
                宇宙万象 · 智慧之书
            </div>
            <div className="absolute bottom-[10%] left-[5%] pointer-events-none select-none opacity-[0.06] font-serif text-6xl text-stone-800 animate-float-delayed">
                Gallery
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-4xl font-bold text-ink mb-4 tracking-[0.2em]">万象图鉴</h1>
                    <p className="text-stone-500 text-sm tracking-widest">探索塔罗的符号世界</p>
                </div>

                <div className="animate-fade-in">
                    <div className="mb-8 max-w-md mx-auto">
                        <input
                            type="text"
                            placeholder="搜索牌名 (如: 愚人, Fool)..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setDisplayCount(CARDS_PER_PAGE); // Reset display count on search
                            }}
                            className="ink-input w-full text-center"
                        />
                    </div>

                    {/* Card Count Info */}
                    <div className="text-center mb-6 text-sm text-stone-500">
                        显示 {displayedCards.length} / {filteredCards.length} 张牌
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {displayedCards.map((card) => (
                            <WikiCard
                                key={card.id}
                                card={card}
                                onClick={() => handleCardClick(card)}
                            />
                        ))}
                    </div>

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={handleLoadMore}
                                className="btn-seal flex items-center gap-2 px-8 py-3"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                                <span>加载更多 ({filteredCards.length - displayCount} 张)</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {selectedCard && (
                <CardDetailModal card={selectedCard} onClose={handleCloseModal} />
            )}
        </div>
    );
}
