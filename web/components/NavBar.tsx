'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserInfo {
  username: string;
  email: string;
  is_vip: boolean;
  tier: 'free' | 'vip' | 'svip';
}

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);

  // Auth Guard & User Fetch
  useEffect(() => {
    // Skip check on login page
    if (pathname === '/') return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    // Fetch user info
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Token expired or invalid
          localStorage.removeItem('token');
          router.push('/');
        }
      } catch (err) {
        console.error("Failed to fetch user info", err);
      }
    };

    fetchUser();
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  // Do not render NavBar on login page to keep it clean
  if (pathname === '/') return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f5f0]/90 backdrop-blur-sm border-b border-stone-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="font-serif font-bold text-xl md:text-2xl tracking-[0.2em] text-ink flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#9a2b2b] rounded-sm transform rotate-3 group-hover:rotate-0 transition-transform duration-300"></div>
              <span className="relative text-[#f5f5f0] text-xl font-light">易</span>
            </div>
            <div className="flex flex-col leading-none pt-1">
              <span className="text-sm md:text-base font-medium tracking-[0.3em] text-stone-500 uppercase tracking-widest">EasyDynasty</span>
              <span className="text-lg md:text-xl">启示录</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-2">
            <Link 
              href="/dashboard" 
              className={`px-4 py-1.5 rounded-sm text-sm tracking-wide transition-all duration-300 ${
                isActive('/dashboard') 
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
            <Link 
              href="/vip" 
              className={`px-4 py-1.5 rounded-sm text-sm tracking-wide transition-all duration-300 ${
                isActive('/vip') 
                  ? 'bg-[#9a2b2b] text-white shadow-md' 
                  : 'text-[#9a2b2b] font-bold hover:bg-[#9a2b2b]/10'
              }`}
            >
              会员
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          
          {user && (
            <Link href="/vip" className="flex items-center gap-3 bg-white/50 px-3 py-1 rounded-full border border-stone-200 hover:bg-white/80 transition-all">
               <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-600">
                  {user.username[0].toUpperCase()}
               </div>
               <div className="flex flex-col leading-none">
                  <span className="text-xs font-bold text-stone-700">{user.username}</span>
                  <span className={`text-[10px] scale-90 origin-left font-bold ${
                    user.tier === 'svip' ? 'text-[#9a2b2b]' : 
                    user.tier === 'vip' ? 'text-stone-800' : 'text-stone-400'
                  }`}>
                    {user.tier === 'svip' ? '高级 SVIP' : user.tier === 'vip' ? '普通 VIP' : '普通用户'}
                  </span>
               </div>
            </Link>
          )}

          <button 
            onClick={handleLogout} 
            className="text-stone-600 hover:text-[#9a2b2b] transition-colors p-2 rounded-full hover:bg-stone-200/50"
            title="退出登录"
          >
            <span className="sr-only">退出</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}