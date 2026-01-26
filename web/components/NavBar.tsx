'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { MenuIcon, CloseIcon, BookIcon, TarotIcon, Volume2Icon, VolumeXIcon, LogoIcon } from '@/components/Icons';
import { useDeck } from '@/context/DeckContext';
import { useSound } from '@/context/SoundContext';
import ThemeToggle from './ThemeToggle';

function SoundToggle() {
    const { isMuted, toggleMute } = useSound();
    return (
        <button
            onClick={toggleMute}
            className="p-1.5 rounded-sm text-stone-600 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-700/50 hover:text-[var(--accent-main)] transition-all"
            title={isMuted ? "开启音效" : "静音"}
        >
            {isMuted ? <VolumeXIcon className="w-4 h-4" /> : <Volume2Icon className="w-4 h-4" />}
        </button>
    );
}

function DeckSwitcher() {
    const { currentDeck, setDeck, availableDecks } = useDeck();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentDeckName = availableDecks.find((d) => d.id === currentDeck)?.name || '默认牌组';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-3 py-1.5 rounded-sm text-sm tracking-wide text-stone-600 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-700/50 flex items-center gap-1.5 transition-all border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
            >
                <span className="w-2 h-2 rounded-full bg-[var(--accent-main)]"></span>
                {currentDeckName}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-md shadow-lg overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                    {availableDecks.map((deck) => (
                        <button
                            key={deck.id}
                            onClick={() => {
                                setDeck(deck.id);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-stone-50 dark:hover:bg-slate-800 transition-colors flex flex-col ${currentDeck === deck.id ? 'bg-stone-100 dark:bg-slate-800 text-[var(--accent-main)]' : 'text-stone-600 dark:text-stone-400'}`}
                        >
                            <span className="font-medium">{deck.name}</span>
                            <span className="text-[10px] text-stone-400 dark:text-stone-500">{deck.description}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function DeckSwitcherMobile() {
    const { currentDeck, setDeck, availableDecks } = useDeck();

    return (
        <div className="flex flex-col gap-2">
            {availableDecks.map((deck) => (
                <button
                    key={deck.id}
                    onClick={() => setDeck(deck.id)}
                    className={`text-sm px-4 py-2 rounded-full border transition-all ${currentDeck === deck.id
                        ? 'border-[var(--accent-main)] text-[var(--accent-main)] bg-[var(--accent-main)]/5'
                        : 'border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400'
                        }`}
                >
                    {deck.name}
                </button>
            ))}
        </div>
    );
}

function DeckNameDisplay() {
    const { currentDeck, availableDecks } = useDeck();
    const currentDeckName = availableDecks.find((d) => d.id === currentDeck)?.name || '默认';
    // Shorten long names if needed
    const displayName = currentDeckName.split('(')[0].trim();
    return <>{displayName}</>;
}

export default function NavBar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname.startsWith(path)) return true;
        return false;
    };

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-[var(--nav-bg)] backdrop-blur-md border-b border-stone-200 dark:border-white/5 shadow-sm font-serif transition-colors duration-500">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group z-50">
                        <div className="relative w-10 h-10 transition-transform duration-500 group-hover:rotate-12 text-[var(--accent-main)]">
                            <LogoIcon className="w-full h-full drop-shadow-md" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold font-serif text-[var(--text-main)] tracking-[0.2em] leading-none">
                                易朝
                            </span>
                            <span className="text-[9px] text-[var(--accent-main)] uppercase tracking-[0.3em] font-medium leading-none mt-1">
                                Dynasty
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1 lg:gap-2">
                        <Link
                            href="/draw"
                            className={`px-3 lg:px-4 py-1.5 rounded-sm text-sm tracking-wide transition-all flex items-center gap-1.5 ${isActive('/draw') ? 'bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-700/50'}`}
                        >
                            <TarotIcon className="w-4 h-4" /> 塔罗占卜
                        </Link>
                        <Link
                            href="/wiki"
                            className={`px-3 lg:px-4 py-1.5 rounded-sm text-sm tracking-wide transition-all flex items-center gap-1.5 ${isActive('/wiki') ? 'bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-700/50'}`}
                        >
                            <BookIcon className="w-4 h-4" /> 牌灵图鉴
                        </Link>
                        <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-1"></div>
                        <ThemeToggle />
                        <SoundToggle />
                        <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-1"></div>
                        <DeckSwitcher />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-3">
                        {/* Current Deck Indicator (Mobile) */}
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-main)]"></span>
                            <span className="text-xs font-medium text-stone-600 dark:text-stone-300 truncate max-w-[80px]">
                                <DeckNameDisplay />
                            </span>
                        </div>
                        
                        <ThemeToggle />
                        <SoundToggle />
                        <button
                            className="text-stone-600 dark:text-stone-300 focus:outline-none p-1"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? (
                                <CloseIcon className="w-6 h-6" />
                            ) : (
                                <MenuIcon className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay (Sidebar Drawer) - Rendered at body level */}
            {/* Backdrop */}
            <div
                className={`md:hidden fixed inset-0 z-[9998] bg-stone-900/20 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMenuOpen(false)}
            ></div>

            {/* Drawer Panel */}
            <div
                className={`md:hidden fixed top-0 right-0 z-[9999] h-full w-[75%] max-w-[300px] bg-[#fdfdfc] dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Drawer Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-stone-200/50 dark:border-stone-800">
                    <span className="text-sm font-bold text-stone-400 uppercase tracking-widest">
                        MENU
                    </span>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="text-stone-500 hover:text-[var(--accent-main)] transition-colors"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-8">
                    {/* Navigation Links */}
                    <div className="flex flex-col gap-2">
                        {[
                            { label: '塔罗占卜', path: '/draw', icon: <TarotIcon /> },
                            { label: '牌灵图鉴', path: '/wiki', icon: <BookIcon /> },
                        ].map((link) => (
                            <Link
                                key={link.path}
                                href={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-4 px-4 py-3 rounded-lg text-base font-medium transition-all ${isActive(link.path)
                                    ? 'bg-[var(--accent-main)]/5 text-[var(--accent-main)]'
                                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                                    }`}
                            >
                                <span className={`${isActive(link.path) ? 'text-[var(--accent-main)]' : 'text-stone-400'}`}>
                                    {link.icon}
                                </span>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="h-px w-full bg-stone-200/50 dark:bg-stone-800"></div>

                    {/* Deck Switcher Section */}
                    <div className="flex flex-col gap-4">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest px-2">
                            选择牌组 / Deck
                        </span>
                        <DeckSwitcherMobile />
                    </div>
                </div>

                {/* Drawer Footer */}
                <div className="p-6 border-t border-stone-200/50 dark:border-stone-800 bg-stone-50/50 dark:bg-slate-950/50">
                    <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 uppercase tracking-widest">
                        <span>EasyDynasty</span>
                        <span>•</span>
                        <span>2024</span>
                    </div>
                </div>
            </div>
        </>
    );
}
