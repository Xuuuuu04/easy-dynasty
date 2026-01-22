'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { MenuIcon, CloseIcon, BookIcon, TarotIcon } from '@/components/Icons';

export default function NavBar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f5f0]/95 backdrop-blur-md border-b border-stone-200 shadow-sm font-serif">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group z-50">
          <div className="relative w-10 h-10 transition-transform duration-500 group-hover:rotate-12">
            <img src="/favicon.svg" alt="易朝" className="w-full h-full drop-shadow-md" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold font-serif text-ink tracking-[0.2em] leading-none">易朝</span>
            <span className="text-[9px] text-[#9a2b2b] uppercase tracking-[0.3em] font-medium leading-none mt-1">Dynasty</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link href="/draw" className={`px-3 lg:px-4 py-1.5 rounded-sm text-sm tracking-wide transition-all flex items-center gap-1.5 ${isActive('/draw') ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-200/50'}`}>
            <TarotIcon className="w-4 h-4" /> 塔罗占卜
          </Link>
          <Link href="/wiki" className={`px-3 lg:px-4 py-1.5 rounded-sm text-sm tracking-wide transition-all flex items-center gap-1.5 ${isActive('/wiki') ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-200/50'}`}>
            <BookIcon className="w-4 h-4" /> 牌灵图鉴
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          <button className="text-stone-600 focus:outline-none" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`md:hidden fixed inset-0 z-40 bg-[#f5f5f0] transition-all duration-300 flex flex-col items-center justify-center gap-8 ${isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10" style={{ backgroundImage: 'url("/rice-paper-2.png")' }}></div>

        <div className="flex flex-col gap-6 text-center w-full max-w-xs animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {[
            { label: '塔罗占卜', path: '/draw', icon: <TarotIcon /> },
            { label: '牌灵图鉴', path: '/wiki', icon: <BookIcon /> },
          ].map(link => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={`text-xl font-serif py-3 border-b border-stone-200 hover:text-[#9a2b2b] hover:border-[#9a2b2b] transition-all flex items-center justify-center gap-3 ${isActive(link.path) ? 'text-[#9a2b2b] border-[#9a2b2b] font-bold' : 'text-stone-600'}`}
            >
              {link.icon && <span className="w-5 h-5">{link.icon}</span>}
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}