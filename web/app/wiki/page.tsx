'use client';

import { useState, useMemo } from 'react';
import tarotCardsData from '../../data/tarot-cards.json';
import { TarotIcon, BaziIcon } from '@/components/Icons';
import Image from 'next/image';
import { getCardImage } from '@/utils/cardImages';

// Define explicit type for card data
interface TarotCardData {
    id: number | string;
    name: string;
    englishName: string;
    suit: string;
    uprightKeywords: string[];
    reversedKeywords: string[];
}

export default function WikiPage() {
    const [activeTab, setActiveTab] = useState<'tarot' | 'bazi'>('tarot');
    const [search, setSearch] = useState('');
    const [flippedCards, setFlippedCards] = useState<Set<number | string>>(new Set());

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

    const toggleFlip = (id: number | string) => {
        const next = new Set(flippedCards);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setFlippedCards(next);
    };

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
                                <div key={card.id} className="perspective-1000 group cursor-pointer h-[320px]" onClick={() => toggleFlip(card.id)}>
                                    <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${flippedCards.has(card.id) ? 'rotate-y-180' : ''}`}>
                                        
                                        {/* Front Face: Card Art/Name */}
                                        <div className="absolute inset-0 backface-hidden rounded-lg overflow-hidden shadow-md border border-stone-200 bg-white flex flex-col">
                                            {/* Top Art Area */}
                                            <div className="flex-1 relative bg-stone-100 flex items-center justify-center overflow-hidden">
                                                <Image 
                                                    src={getCardImage(card.id)}
                                                    alt={card.name}
                                                    fill
                                                    className="object-cover"
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
                                                <span className="text-[9px] text-[#9a2b2b] block mt-2 opacity-60">点击翻转查看详情</span>
                                            </div>
                                        </div>

                                        {/* Back Face: Details */}
                                        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg overflow-hidden shadow-lg border border-[#9a2b2b]/30 bg-[#fffcf5] p-5 flex flex-col">
                                            <div className="text-center mb-4 pb-2 border-b border-stone-200">
                                                <h3 className="text-lg font-bold text-[#9a2b2b]">{card.name}</h3>
                                                <p className="text-[9px] text-stone-400 uppercase tracking-widest">{card.suit === 'major' ? '大阿卡纳' : '小阿卡纳'}</p>
                                            </div>
                                            
                                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 text-left px-2">
                                                <div>
                                                    <span className="text-[10px] font-bold text-emerald-600 block mb-1 uppercase tracking-widest">正位含义</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {card.uprightKeywords.map((k, i) => (
                                                            <span key={i} className="text-xs text-stone-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{k}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-amber-600 block mb-1 uppercase tracking-widest">逆位含义</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {card.reversedKeywords.map((k, i) => (
                                                            <span key={i} className="text-xs text-stone-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">{k}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
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
        </div>
    );
}
