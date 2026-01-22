'use client';

import { useState, useMemo } from 'react';
import tarotCardsData from '../../data/tarot-cards.json';
import { TarotIcon, BaziIcon } from '@/components/Icons';
import Image from 'next/image';
import { getCardImage } from '@/utils/cardImages';
import CardDetailModal from '@/components/CardDetailModal';

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

export default function WikiPage() {
    const [activeTab, setActiveTab] = useState<'tarot' | 'bazi'>('tarot');
    const [search, setSearch] = useState('');
    const [selectedCard, setSelectedCard] = useState<TarotCardData | null>(null);

    const allTarotCards = useMemo(() => {
        const majors = tarotCardsData.majorArcana || [];
        const minors = tarotCardsData.minorArcana || {};
        return [
            ...majors,
            ...(minors.wands || []),
            ...(minors.cups || []),
            ...(minors.swords || []),
            ...(minors.pentacles || [])
        ] as TarotCardData[];
    }, []);

    const filteredCards = useMemo(() => {
        if (!search) return allTarotCards;
        const lowerSearch = search.toLowerCase();
        return allTarotCards.filter(c =>
            c.name.includes(search) ||
            c.englishName.toLowerCase().includes(lowerSearch)
        );
    }, [search, allTarotCards]);

    return (
        <div className="min-h-screen bg-[#f5f5f0] pt-24 pb-12 px-4 font-serif text-stone-800">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-4xl font-bold text-ink mb-4 tracking-[0.2em]">万象图鉴</h1>
                    <p className="text-stone-500 text-sm tracking-widest">探索塔罗与命理的符号世界</p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-6 mb-10 animate-slide-up">
                    <button
                        onClick={() => setActiveTab('tarot')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all ${activeTab === 'tarot' ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}
                    >
                        <TarotIcon className="w-4 h-4" /> 塔罗
                    </button>
                    <button
                        onClick={() => setActiveTab('bazi')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all ${activeTab === 'bazi' ? 'bg-[#9a2b2b] text-white border-[#9a2b2b]' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}
                    >
                        <BaziIcon className="w-4 h-4" /> 命理
                    </button>
                </div>

                {activeTab === 'tarot' && (
                    <div className="animate-fade-in">
                        <div className="mb-8 max-w-md mx-auto">
                            <input
                                type="text"
                                placeholder="搜索牌名 (如: 愚人, Fool)..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="ink-input w-full text-center"
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {filteredCards.map(card => (
                                <div
                                    key={card.id}
                                    className="group cursor-pointer h-[320px] transition-transform hover:-translate-y-2"
                                    onClick={() => setSelectedCard(card)}
                                >
                                    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-md border border-stone-200 bg-white flex flex-col hover:shadow-xl transition-shadow">
                                        {/* Top Art Area */}
                                        <div className="flex-1 relative bg-stone-100 flex items-center justify-center overflow-hidden">
                                            <Image
                                                src={getCardImage(card.id)}
                                                alt={card.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                            />

                                            {/* Card Name Overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur-sm border-t border-stone-100 text-center">
                                                <h3 className="text-base font-bold text-ink mb-0.5">{card.name}</h3>
                                                <p className="text-[10px] text-stone-400 uppercase tracking-widest">{card.englishName}</p>
                                            </div>
                                        </div>

                                        {/* Bottom Keywords Preview */}
                                        <div className="h-auto p-3 bg-stone-50 border-t border-stone-200 text-center">
                                            <p className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed">
                                                {card.uprightKeywords.slice(0, 3).join(' · ')}
                                            </p>
                                            <span className="text-[9px] text-[#9a2b2b] block mt-2 opacity-60 group-hover:opacity-100 transition-opacity">点击查看解析</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'bazi' && (
                    <div className="text-center py-20 animate-fade-in ink-card bg-white">
                        <div className="w-16 h-16 rounded-full bg-stone-100 mx-auto mb-4 flex items-center justify-center text-2xl text-stone-400">
                            <BaziIcon />
                        </div>
                        <h2 className="text-xl font-bold text-ink mb-2">命理词典编撰中</h2>
                        <p className="text-stone-500 text-sm">十神、神煞、纳音等知识即将上线...</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedCard && (
                <CardDetailModal
                    card={selectedCard}
                    onClose={() => setSelectedCard(null)}
                />
            )}
        </div>
    );
}
