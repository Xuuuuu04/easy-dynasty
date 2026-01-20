'use client';

import { useEffect, useState } from 'react';

export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(setOrders)
        .catch(console.error);
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <h2 className="text-2xl font-bold text-ink font-serif tracking-wider">订单管理</h2>
                <span className="text-xs text-stone-400 bg-stone-100 px-3 py-1 rounded-full">总计: {orders.length}</span>
            </div>
            
            <div className="ink-card overflow-hidden">
                <table className="min-w-full divide-y divide-stone-100">
                    <thead className="bg-[#f5f5f0]/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">订单号</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">用户</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">商品</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">金额</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">状态</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">时间</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-stone-50">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-[#fffcf5] transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-stone-400 font-mono">{order.trade_no}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-ink">{order.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">{order.item}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#9a2b2b]">¥{order.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        order.status === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-400'
                                    }`}>
                                        {order.status === 1 ? '已支付' : '待支付'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-stone-400">{new Date(order.date).toLocaleString('zh-CN')}</td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-xs text-stone-400">暂无订单记录</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
