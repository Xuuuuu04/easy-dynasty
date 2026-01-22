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

    return (
        <div ref={containerRef} className="relative w-full group">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full appearance-none bg-transparent border-b-[1.5px] border-stone-300 py-3 text-lg md:text-xl font-serif text-ink focus:outline-none focus:border-[#9a2b2b] cursor-pointer text-left transition-all duration-300"
            >
                <span className={value ? 'text-ink' : 'text-stone-300'}>
                    {value ? `${value.name} (${value.cardCount}张)` : placeholder}
                </span>
            </button>

            {/* Custom Arrow */}
            <div
                className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 group-hover:text-[#9a2b2b] transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}
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
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </div>

            {/* Bottom Border Animation */}
            <div
                className={`absolute bottom-0 left-0 h-[1.5px] bg-[#9a2b2b] transition-all duration-500 ${isOpen ? 'w-full' : 'w-0 group-hover:w-full'}`}
            ></div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[#fffdf5] border border-stone-200 rounded-sm shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden animate-fade-in-dropdown">
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar"
                    >
                        {spreads.map((spread) => (
                            <button
                                key={spread.id}
                                type="button"
                                onClick={() => {
                                    onChange(spread);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-3.5 text-left font-serif transition-all duration-200 border-l-2 ${value?.id === spread.id
                                    ? 'border-[#9a2b2b] bg-[#9a2b2b]/5 text-[#9a2b2b] font-bold'
                                    : 'border-transparent hover:border-[#9a2b2b]/30 hover:bg-stone-50 text-stone-700'
                                    }`}
                            >
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-base md:text-lg font-semibold">{spread.name}</span>
                                        <span
                                            className={`text-xs md:text-sm ${value?.id === spread.id ? 'text-[#9a2b2b]/70' : 'text-stone-400'}`}
                                        >
                                            {spread.cardCount}张
                                        </span>
                                    </div>
                                    <p className={`text-xs md:text-sm leading-relaxed ${value?.id === spread.id ? 'text-[#9a2b2b]/80' : 'text-stone-500'}`}>
                                        {spread.description}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
