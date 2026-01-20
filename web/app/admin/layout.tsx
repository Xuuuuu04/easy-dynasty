'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// Icons
const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="9" y1="21" x2="9" y2="9"></line>
  </svg>
)
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
)
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
)
const OrdersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
)
const LogsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>
)
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/');
            return;
        }
        
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json()).then(user => {
            if (!user.is_superuser) {
                alert('Access Denied');
                router.push('/dashboard');
            } else {
                setAuthorized(true);
            }
        }).catch(() => router.push('/'));
    }, [router]);

    if (!authorized) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f0] text-stone-500 font-serif">
            <div className="animate-pulse tracking-widest">正在核验天机权限...</div>
        </div>
    );

    const navItems = [
        { name: '概览', path: '/admin', icon: <ChartIcon /> },
        { name: '用户管理', path: '/admin/users', icon: <UsersIcon /> },
        { name: '订单管理', path: '/admin/orders', icon: <OrdersIcon /> },
        { name: '系统日志', path: '/admin/logs', icon: <LogsIcon /> },
        { name: '系统设置', path: '/admin/settings', icon: <SettingsIcon /> },
    ];

    return (
        <div className="min-h-screen bg-[#f5f5f0] flex font-serif text-stone-800">
            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-30 z-0" 
                 style={{ backgroundImage: 'url("/rice-paper-2.png")', backgroundBlendMode: 'multiply' }}></div>

            {/* Sidebar */}
            <aside className="w-64 border-r border-stone-300 bg-white/40 backdrop-blur-sm flex flex-col z-10">
                <div className="p-8 border-b border-stone-200">
                    <h1 className="text-xl font-bold text-ink tracking-[0.3em]">易 · 后台</h1>
                    <p className="text-[10px] text-stone-400 mt-2 uppercase tracking-widest">Admin Console</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => (
                        <Link 
                            key={item.path} 
                            href={item.path}
                            className={`flex items-center gap-4 px-6 py-3.5 rounded-sm transition-all duration-300 ${
                                pathname === item.path 
                                    ? 'bg-[#9a2b2b] text-[#f5f5f0] shadow-md' 
                                    : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-900'
                            }`}
                        >
                            <span className={pathname === item.path ? 'text-white' : 'text-stone-400'}>{item.icon}</span>
                            <span className="text-sm font-medium tracking-widest">{item.name}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-6 border-t border-stone-200">
                    <button 
                        onClick={() => { localStorage.removeItem('token'); router.push('/'); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-xs text-stone-500 hover:text-[#9a2b2b] transition-colors"
                    >
                        <LogoutIcon />
                        <span className="tracking-widest">退出登录</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto z-10 relative">
                <div className="p-8 md:p-12 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
