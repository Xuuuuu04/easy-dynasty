'use client';

import { useRouter } from 'next/navigation';
import { useIsClient } from '@/hooks/useIsClient';

export default function Home() {
    const router = useRouter();
    const mounted = useIsClient();

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-bg-main text-text-main font-serif">
            {/* 1. Immersive Divination Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Base Paper Texture - Lower opacity in dark mode */}
                <div className="absolute inset-0 opacity-40 dark:opacity-10 bg-[url('/rice-paper-2.png')]"></div>

                {/* Rotating Bagua Watermark */}
                <div className="absolute -top-[10%] -right-[10%] w-[70vw] h-[70vw] opacity-[0.04] animate-[spin_120s_linear_infinite]">
                    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                        <circle cx="50" cy="50" r="48" />
                        <circle cx="50" cy="50" r="35" />
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                            <line
                                key={deg}
                                x1="50"
                                y1="2"
                                x2="50"
                                y2="15"
                                transform={`rotate(${deg} 50 50)`}
                            />
                        ))}
                        <path d="M50 30 Q60 50 50 70 Q40 50 50 30" />
                    </svg>
                </div>

                {/* Floating Tarot Card Outlines */}
                <div className="absolute top-[20%] left-[5%] w-32 h-56 border border-text-main/10 rounded-lg rotate-[-15deg] animate-float opacity-30"></div>
                <div className="absolute bottom-[15%] right-[10%] w-40 h-64 border border-accent-main/10 rounded-lg rotate-[12deg] animate-float-delayed opacity-30"></div>

                {/* Ink Wash Gradients */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-text-muted/10 via-transparent to-accent-main/5"></div>
            </div>

            {/* 2. Main Glass Card Container */}
            <div
                className={`relative z-10 w-full max-w-[800px] min-h-[400px] md:min-h-[500px] bg-card-bg/70 backdrop-blur-2xl rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-white/20 dark:border-white/5 flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ease-out transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} p-8 md:p-12 text-center`}
            >
                <div className="mb-8 md:mb-10 relative group">
                    {/* Shadow Glow */}
                    <div className="absolute inset-0 bg-accent-main blur-2xl opacity-40 animate-pulse"></div>
                    {/* The Seal */}
                    <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto bg-accent-main rounded-sm flex items-center justify-center shadow-2xl border border-white/10">
                        <div className="w-[85%] h-[85%] border border-white/20 rounded-sm flex items-center justify-center">
                            <span className="text-white text-5xl md:text-6xl font-bold font-serif select-none">
                                塔
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 md:space-y-6 mb-10 md:mb-12">
                    <div className="space-y-2">
                        <h2 className="text-3xl md:text-4xl text-text-main tracking-[0.6em] font-serif font-light">
                            塔罗启示录
                        </h2>
                        <p className="text-[10px] md:text-xs text-accent-main uppercase tracking-[0.6em] font-bold">
                            Tarot Revelation
                        </p>
                    </div>
                    <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-accent-main/50 to-transparent mx-auto"></div>
                    <p className="text-text-muted text-xs md:text-sm tracking-[0.3em] leading-loose font-serif">
                        洞悉潜意识的低语
                        <br />
                        指引命运的流向
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full md:w-auto px-4 md:px-0">
                    <button
                        onClick={() => router.push('/draw')}
                        className="group relative px-6 md:px-10 py-3 md:py-4 bg-text-main text-bg-main text-base md:text-lg rounded-sm font-bold tracking-[0.4em] shadow-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98] w-full md:w-auto"
                    >
                        <div className="absolute inset-0 bg-accent-main translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            开启占卜
                            <span className="text-base md:text-lg group-hover:translate-x-1 transition-transform">
                                →
                            </span>
                        </span>
                    </button>

                    <button
                        onClick={() => router.push('/wiki')}
                        className="px-6 md:px-10 py-3 md:py-4 border border-text-muted text-text-sub text-base md:text-lg rounded-sm font-bold tracking-[0.4em] hover:bg-text-main/10 hover:border-text-main transition-all active:scale-[0.98] w-full md:w-auto"
                    >
                        牌灵图鉴
                    </button>
                </div>

                <div className="mt-10 md:mt-16 text-[9px] text-text-muted font-sans tracking-[0.2em] uppercase opacity-50">
                    <span>By Antigravity Agent</span>
                </div>
            </div>
        </div>
    );
}
