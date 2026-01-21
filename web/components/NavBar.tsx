'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { MenuIcon, CloseIcon, LogoutIcon, SettingsIcon, BellIcon, ArchiveIcon, BookIcon, TarotIcon, BaziIcon, VipIcon, MessageIcon } from '@/components/Icons';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  is_vip: boolean;
  is_superuser: boolean;
  tier: 'free' | 'vip' | 'svip';
}

interface Notification {
  id: number;
  type: string;
  content: string;
  admin_reply: string;
  is_read_by_user: boolean;
  created_at: string;
}

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Auth Guard & User Fetch
  useEffect(() => {
    if (pathname === '/') return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          fetchNotifications(token);
        } else {
          localStorage.removeItem('token');
          router.push('/');
        }
      } catch (err) {
        console.error("Failed to fetch user info", err);
      }
    };

    fetchUser();
  }, [pathname, router]);

  const fetchNotifications = async (token: string) => {
      try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/feedback/notifications`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
              setNotifications(await res.json());
          }
      } catch (e) {
          console.error(e);
      }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  const markRead = async (id: number) => {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/feedback/${id}/read`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Optionally redirect to feedback page to see details
      router.push('/feedback');
  };

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  // Close notifications on outside click
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
              setIsNotifOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (pathname === '/' || pathname.startsWith('/admin')) return null;

  const unreadCount = notifications.filter(n => !n.is_read_by_user).length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5f5f0]/95 backdrop-blur-md border-b border-stone-200 shadow-sm font-serif">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group z-50">
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
          <Link href="/dashboard" className={`px-3 lg:px-4 py-1.5 rounded-sm text-sm tracking-wide transition-all flex items-center gap-1.5 ${isActive('/dashboard') ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-200/50'}`}>
             <TarotIcon className="w-4 h-4" /> 塔罗
          </Link>
          <Link href="/bazi" className={`px-3 lg:px-4 py-1.5 rounded-sm text-sm tracking-wide transition-all flex items-center gap-1.5 ${isActive('/bazi') ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-200/50'}`}>
             <BaziIcon className="w-4 h-4" /> 八字
          </Link>
          <Link href="/profiles" className={`px-3 lg:px-4 py-1.5 rounded-sm text-sm tracking-wide transition-all flex items-center gap-1.5 ${isActive('/profiles') ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-200/50'}`}>
             <ArchiveIcon className="w-4 h-4" /> 档案
          </Link>
          <Link href="/wiki" className={`px-3 lg:px-4 py-1.5 rounded-sm text-sm tracking-wide transition-all flex items-center gap-1.5 ${isActive('/wiki') ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-200/50'}`}>
             <BookIcon className="w-4 h-4" /> 图鉴
          </Link>
          <Link href="/vip" className={`px-3 lg:px-4 py-1.5 rounded-sm text-sm tracking-wide transition-all flex items-center gap-1.5 ${isActive('/vip') ? 'bg-[#9a2b2b] text-white' : 'text-[#9a2b2b] font-bold hover:bg-[#9a2b2b]/10'}`}>
             <VipIcon className="w-4 h-4" /> 会员
          </Link>
          <Link href="/feedback" className={`px-3 lg:px-4 py-1.5 rounded-sm text-sm tracking-wide transition-all flex items-center gap-1.5 ${isActive('/feedback') ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-200/50'}`}>
             <MessageIcon className="w-4 h-4" /> 反馈
          </Link>
          
          {user?.is_superuser && (
            <Link href="/admin" className="px-3 lg:px-4 py-1.5 rounded-sm text-sm tracking-wide transition-all bg-stone-900 text-white shadow-md hover:bg-black font-bold ml-2 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-stone-400" />
              后台
            </Link>
          )}
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-stone-600 hover:text-[#9a2b2b] relative transition-colors"
              >
                  <BellIcon className="w-5 h-5" />
                  {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-[#9a2b2b] rounded-full animate-pulse"></span>
                  )}
              </button>
              
              {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-stone-200 shadow-xl rounded-sm z-50 overflow-hidden animate-slide-up">
                      <div className="p-3 border-b border-stone-100 bg-stone-50">
                          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest">消息中心</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                          {notifications.length === 0 ? (
                              <div className="p-6 text-center text-stone-400 text-sm">暂无新消息</div>
                          ) : (
                              notifications.map(n => (
                                  <div key={n.id} className="p-4 border-b border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer" onClick={() => markRead(n.id)}>
                                      <div className="flex items-start justify-between mb-1">
                                          <span className="text-xs font-bold text-[#9a2b2b]">管理员回复</span>
                                          <span className="text-[10px] text-stone-400">{new Date(n.created_at).toLocaleDateString()}</span>
                                      </div>
                                      <p className="text-sm text-stone-700 line-clamp-2">{n.admin_reply}</p>
                                      <p className="text-[10px] text-stone-400 mt-1 truncate">原贴: {n.content}</p>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              )}
          </div>

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
                    {user.is_superuser ? '管理员' : (user.tier === 'svip' ? '高级 SVIP' : user.tier === 'vip' ? '普通 VIP' : '普通用户')}
                  </span>
               </div>
            </Link>
          )}
          
          <button onClick={handleLogout} className="text-stone-600 hover:text-[#9a2b2b] transition-colors p-2 rounded-full hover:bg-stone-200/50" title="退出登录">
            <LogoutIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="text-stone-600 relative">
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-[#9a2b2b] rounded-full"></span>}
            </button>
            <button className="text-stone-600 focus:outline-none" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`md:hidden fixed inset-0 z-40 bg-[#f5f5f0] transition-all duration-300 flex flex-col items-center justify-center gap-8 ${isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10" style={{ backgroundImage: 'url("/rice-paper-2.png")' }}></div>
          
          {user && (
             <div className="flex flex-col items-center gap-2 mb-4 animate-slide-up">
                <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center text-2xl font-bold text-stone-600 shadow-inner border-2 border-white">
                    {user.username[0].toUpperCase()}
                </div>
                <div className="text-xl font-bold text-ink">{user.username}</div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${user.tier === 'svip' ? 'bg-[#9a2b2b]/10 text-[#9a2b2b] border-[#9a2b2b]/20' : 'bg-stone-100 text-stone-500 border-stone-200'}`}>
                    {user.is_superuser ? '管理员' : (user.tier === 'svip' ? '高级 SVIP' : user.tier === 'vip' ? '普通 VIP' : '普通用户')}
                </span>
             </div>
          )}

          <div className="flex flex-col gap-6 text-center w-full max-w-xs animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {[
                { label: '塔罗占卜', path: '/dashboard', icon: <TarotIcon /> },
                { label: '八字排盘', path: '/bazi', icon: <BaziIcon /> },
                { label: '亲友档案', path: '/profiles', icon: <ArchiveIcon /> },
                { label: '万象图鉴', path: '/wiki', icon: <BookIcon /> },
                { label: '会员中心', path: '/vip', icon: <VipIcon /> },
                { label: '反馈工单', path: '/feedback', icon: <MessageIcon /> },
                ...(user?.is_superuser ? [{ label: '管理后台', path: '/admin', icon: <SettingsIcon /> }] : [])
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
            
            <button 
                onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                className="text-stone-400 mt-8 hover:text-[#9a2b2b] transition-colors flex items-center justify-center gap-2"
            >
                <LogoutIcon className="w-5 h-5" />
                <span>退出登录</span>
            </button>
          </div>
      </div>
    </nav>
  );
}