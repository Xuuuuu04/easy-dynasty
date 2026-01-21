'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChartIcon, UsersIcon, SettingsIcon, LogoutIcon, OrdersIcon, LogsIcon, MenuIcon, CloseIcon, TarotIcon, BookIcon } from '@/components/Icons';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        { name: '知识库管理', path: '/admin/wiki', icon: <BookIcon /> },
        { name: '订单管理', path: '/admin/orders', icon: <OrdersIcon /> },
        { name: '系统日志', path: '/admin/logs', icon: <LogsIcon /> },
        { name: '系统设置', path: '/admin/settings', icon: <SettingsIcon /> },
    ];

    return (
        <div className="min-h-screen bg-[#f5f5f0] flex flex-col md:flex-row font-serif text-stone-800 relative">
            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-30 z-0" 
                 style={{ backgroundImage: 'url("/rice-paper-2.png")', backgroundBlendMode: 'multiply' }}></div>

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-stone-200 z-30 sticky top-0">
                <span className="font-bold text-lg text-ink tracking-widest">易 · 后台</span>
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-stone-600">
                    <MenuIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 w-64 bg-white/95 backdrop-blur-md border-r border-stone-300 z-50 flex flex-col transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0 md:bg-white/40 md:h-screen md:sticky md:top-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-8 border-b border-stone-200 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-ink tracking-[0.3em]">易 · 后台</h1>
                        <p className="text-[10px] text-stone-400 mt-2 uppercase tracking-widest">Admin Console</p>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-stone-400">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map(item => (
                        <Link 
                            key={item.path} 
                            href={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
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
                
                <div className="p-6 border-t border-stone-200 space-y-2">
                    <Link 
                        href="/dashboard"
                        className="w-full flex items-center gap-3 px-4 py-2 text-xs text-stone-500 hover:text-[#9a2b2b] transition-colors"
                    >
                        <TarotIcon className="w-4 h-4" />
                        <span className="tracking-widest">返回主站</span>
                    </Link>
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
            <main className="flex-1 overflow-auto z-10 relative h-[calc(100vh-64px)] md:h-screen">
                <div className="p-4 md:p-12 max-w-7xl mx-auto pb-24">
                    {children}
                </div>
            </main>
        </div>
    );
}