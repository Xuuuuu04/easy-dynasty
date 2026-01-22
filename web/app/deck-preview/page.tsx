'use client';

import React from 'react';
import Image from 'next/image';

export default function DeckPreviewPage() {
    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-8 text-center text-amber-500 font-serif">
                塔罗牌样式预览
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                {/* RWS Section */}
                <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-2xl font-semibold mb-4 text-center">
                        1. 经典韦特 (Rider-Waite-Smith)
                    </h2>
                    <p className="text-slate-400 text-center mb-6">
                        最为通用、经典的塔罗牌画面。色彩丰富，图案清晰。
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="flex flex-col items-center">
                            <div className="relative w-[100px] h-[160px] md:w-[150px] md:h-[260px] rounded-lg overflow-hidden border-2 border-slate-600 shadow-lg hover:scale-105 transition-transform">
                                <Image
                                    src="/decks_preview/rws/00-Fool.jpg"
                                    alt="The Fool"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 150px, 150px"
                                />
                            </div>
                            <span className="mt-2 text-xs md:text-sm text-slate-300">0. 愚人</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="relative w-[100px] h-[160px] md:w-[150px] md:h-[260px] rounded-lg overflow-hidden border-2 border-slate-600 shadow-lg hover:scale-105 transition-transform">
                                <Image
                                    src="/decks_preview/rws/01-Magician.jpg"
                                    alt="The Magician"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 150px, 150px"
                                />
                            </div>
                            <span className="mt-2 text-xs md:text-sm text-slate-300">I. 魔术师</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="relative w-[100px] h-[160px] md:w-[150px] md:h-[260px] rounded-lg overflow-hidden border-2 border-slate-600 shadow-lg hover:scale-105 transition-transform">
                                <Image
                                    src="/decks_preview/rws/Wands01.jpg"
                                    alt="Ace of Wands"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 150px, 150px"
                                />
                            </div>
                            <span className="mt-2 text-xs md:text-sm text-slate-300">权杖王牌</span>
                        </div>
                    </div>
                </section>

                {/* Marseille Section */}
                <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-2xl font-semibold mb-4 text-center">
                        2. 马赛塔罗 (Tarot de Marseille)
                    </h2>
                    <p className="text-slate-400 text-center mb-6">
                        古朴典雅的木刻风格，历史感浓厚。色彩更佳原始。
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="flex flex-col items-center">
                            <div className="relative w-[100px] h-[160px] md:w-[150px] md:h-[260px] rounded-lg overflow-hidden border-2 border-slate-600 shadow-lg hover:scale-105 transition-transform">
                                <Image
                                    src="/decks_preview/marseille/00-LeMat.jpg"
                                    alt="Le Mat"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 150px, 150px"
                                />
                            </div>
                            <span className="mt-2 text-xs md:text-sm text-slate-300">Le Mat (愚人)</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="relative w-[100px] h-[160px] md:w-[150px] md:h-[260px] rounded-lg overflow-hidden border-2 border-slate-600 shadow-lg hover:scale-105 transition-transform">
                                <Image
                                    src="/decks_preview/marseille/01-LeBateleur.jpg"
                                    alt="Le Bateleur"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 150px, 150px"
                                />
                            </div>
                            <span className="mt-2 text-xs md:text-sm text-slate-300">
                                Le Bateleur (魔术师)
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-center text-slate-500 mt-4">
                        *马赛牌小阿卡纳通常无剧情画面，仅排列符号。
                    </p>
                </section>
            </div>

            <div className="mt-12 text-center text-slate-500 text-sm">
                <p>Preview images sourced from Wikimedia Commons (Public Domain).</p>
            </div>
        </div>
    );
}
