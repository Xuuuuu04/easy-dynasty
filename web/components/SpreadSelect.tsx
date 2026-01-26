'use client';

import { useState, useRef, useEffect } from 'react';
import type { Spread } from '@/types/tarot';

interface SpreadSelectProps {
    spreads: Spread[];
    value: Spread | null;
    onChange: (spread: Spread) => void;
    placeholder?: string;
}

export default function SpreadSelect({
    spreads,
    value,
    onChange,
    placeholder = '请选择适宜的牌阵',
}: SpreadSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const cleanText = (text: string) => {
        return text
            .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}]/gu, '')
            .replace(/[|｜]/g, '·')
            .replace(/\s+/g, ' ')
            .trim();
    };

    return (
        <div ref={containerRef} className="relative w-full group z-40">
            <div className={`absolute left-0 -top-6 text-xs font-serif tracking-[0.2em] transition-all duration-300 ${isOpen || value ? 'text-[var(--accent-main)] opacity-100' : 'text-stone-400 opacity-0'}`}>
                SPREAD SELECTION
            </div>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    relative w-full text-left py-4 px-1
                    bg-transparent
                    border-b-[1.5px] 
                    font-serif transition-all duration-500
                    flex items-center justify-between
                    group-hover:border-[var(--accent-main)]/50
                    ${isOpen
                        ? 'border-[var(--accent-main)]'
                        : 'border-stone-300 dark:border-stone-700'
                    }
                `}
            >
                <div className="flex flex-col gap-1">
                    <span className={`
                        text-lg md:text-xl tracking-wide transition-colors duration-300
                        ${value ? 'text-[var(--text-main)]' : 'text-stone-400 dark:text-stone-600 italic'}
                    `}>
                        {value ? value.name : placeholder}
                    </span>
                    {value && (
                        <span className="text-xs text-[var(--text-secondary)] tracking-wider uppercase opacity-60">
                            {value.englishName}
                        </span>
                    )}
                </div>

                <div className={`
                    w-6 h-6 flex items-center justify-center rounded-full
                    transition-all duration-500 ease-out
                    ${isOpen ? 'rotate-180 bg-[var(--accent-main)] text-white' : 'text-stone-400 group-hover:text-[var(--accent-main)]'}
                `}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>
            </button>

            <div className={`
                absolute top-full left-0 w-full mt-4
                bg-[var(--card-bg)] backdrop-blur-xl
                border border-[var(--card-border)]
                shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]
                dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]
                rounded-sm overflow-hidden
                transition-all duration-300 ease-out origin-top
                ${isOpen
                    ? 'opacity-100 translate-y-0 visible'
                    : 'opacity-0 -translate-y-2 invisible pointer-events-none'
                }
            `}>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {spreads.map((spread) => {
                        const isSelected = value?.id === spread.id;
                        return (
                            <button
                                key={spread.id}
                                type="button"
                                onClick={() => {
                                    onChange(spread);
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full text-left p-4 rounded-sm transition-all duration-300 group/item
                                    border border-transparent relative overflow-hidden
                                    ${isSelected
                                        ? 'bg-[var(--accent-main)]/5 border-[var(--accent-main)]/20'
                                        : 'hover:bg-[var(--text-main)]/5 hover:border-[var(--text-main)]/10'
                                    }
                                `}
                            >
                                {isSelected && (
                                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--accent-main)]" />
                                )}

                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <div className="flex flex-col">
                                        <span className={`
                                            font-serif text-base font-bold tracking-wide
                                            ${isSelected ? 'text-[var(--accent-main)]' : 'text-[var(--text-main)]'}
                                        `}>
                                            {spread.name}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] opacity-60">
                                            {spread.englishName}
                                        </span>
                                    </div>
                                    <span className={`
                                        text-[10px] px-2 py-1 rounded-full border
                                        font-serif tracking-widest whitespace-nowrap
                                        ${isSelected
                                            ? 'border-[var(--accent-main)] text-[var(--accent-main)]'
                                            : 'border-[var(--text-secondary)]/30 text-[var(--text-secondary)]'
                                        }
                                    `}>
                                        {spread.cardCount} CARDS
                                    </span>
                                </div>

                                <p className={`
                                    text-xs leading-relaxed font-serif
                                    ${isSelected ? 'text-[var(--text-main)] opacity-90' : 'text-[var(--text-secondary)] opacity-70'}
                                `}>
                                    {cleanText(spread.description)}
                                </p>
                            </button>
                        );
                    })}
                </div>
                
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--accent-main)]/20 to-transparent" />
            </div>
        </div>
    );
}
