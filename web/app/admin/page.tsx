'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(setStats)
        .catch(console.error);
    }, []);

    if (!stats) return (
        <div className="flex items-center justify-center h-64 text-stone-400 animate-pulse tracking-widest">
            正在读取天机数据...
        </div>
    );

    const cards = [
        { label: '总用户数', value: stats.total_users, desc: '注册道友', color: 'bg-stone-600' },
        { label: 'SVIP 会员', value: stats.total_svip, desc: '核心用户', color: 'bg-[#9a2b2b]' },
        { label: '总营收 (预估)', value: `¥${stats.total_revenue.toFixed(2)}`, desc: '累积功德', color: 'bg-amber-600' },
        { label: '今日塔罗', value: stats.today_tarot_calls, desc: '占卜次数', color: 'bg-indigo-600' },
        { label: '今日八字', value: stats.today_bazi_calls, desc: '排盘次数', color: 'bg-emerald-700' },
    ];

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-ink font-serif tracking-wider">系统概览</h2>
                    <p className="text-xs text-stone-400 mt-1">数据最后更新: {new Date().toLocaleTimeString('zh-CN')}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="ink-card p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-16 h-16 opacity-5 -translate-y-4 translate-x-4 rounded-full ${card.color}`}></div>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">{card.label}</p>
                                <p className="text-3xl font-bold text-ink font-serif">{card.value}</p>
                            </div>
                            <div className={`w-1.5 h-1.5 rounded-full ${card.color}`}></div>
                        </div>
                        <div className="text-[10px] text-stone-400 border-t border-stone-100 pt-2 flex justify-between items-center">
                            <span>{card.desc}</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Placeholder for charts or logs */}
            <div className="ink-card p-8">
                <h3 className="text-lg font-bold text-ink font-serif mb-6 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#9a2b2b] rounded-full"></span>
                    系统动态
                </h3>
                <div className="h-64 flex flex-col items-center justify-center bg-[#f5f5f0]/50 rounded-sm border border-dashed border-stone-300 text-stone-400 gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    <span className="text-xs tracking-wider">暂无实时日志流</span>
                </div>
            </div>
        </div>
    );
}
