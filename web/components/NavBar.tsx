'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f5f0]/90 backdrop-blur-sm border-b border-stone-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-serif font-bold text-2xl tracking-widest text-ink flex items-center gap-2">
            <span className="bg-[#9a2b2b] text-white w-8 h-8 flex items-center justify-center rounded-sm text-sm font-light">易</span>
            <span>EasyDynasty</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-2">
            <Link 
              href="/" 
              className={`px-4 py-1.5 rounded-sm text-sm tracking-wide transition-all duration-300 ${
                isActive('/') && pathname === '/'
                  ? 'bg-stone-800 text-white shadow-md' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              塔罗
            </Link>
            <Link 
              href="/bazi" 
              className={`px-4 py-1.5 rounded-sm text-sm tracking-wide transition-all duration-300 ${
                isActive('/bazi') 
                  ? 'bg-stone-800 text-white shadow-md' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              八字
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/history" className="text-stone-600 hover:text-[#9a2b2b] transition-colors p-2 rounded-full hover:bg-stone-200/50">
            <span className="sr-only">历史</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Link>
          <Link href="/settings" className="text-stone-600 hover:text-[#9a2b2b] transition-colors p-2 rounded-full hover:bg-stone-200/50">
            <span className="sr-only">设置</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}
