'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const { showToast } = useToast();

    const fetchUsers = () => {
        const token = localStorage.getItem('token');
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(setUsers)
        .catch(console.error);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleTierChange = async (userId: number, newTier: string) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/users/${userId}/tier`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tier: newTier })
            });
            if (res.ok) {
                showToast('会员等级已更新', 'success');
                fetchUsers();
            } else {
                showToast('更新失败', 'error');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <h2 className="text-2xl font-bold text-ink font-serif tracking-wider">用户管理</h2>
                <span className="text-xs text-stone-400 bg-stone-100 px-3 py-1 rounded-full">总计: {users.length}</span>
            </div>
            
            <div className="ink-card overflow-hidden">
                <table className="min-w-full divide-y divide-stone-100">
                    <thead className="bg-[#f5f5f0]/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">编号 (ID)</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">账号 (Account)</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">等级 (Tier)</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">注册时间 (Joined)</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">权限操作 (Action)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-stone-50">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-[#fffcf5] transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-stone-400 font-mono">#{user.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-ink font-serif">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                        user.tier === 'svip' ? 'bg-[#9a2b2b]/10 text-[#9a2b2b] border-[#9a2b2b]/20' : 
                                        user.tier === 'vip' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-stone-50 text-stone-500 border-stone-200'
                                    }`}>
                                        {user.tier}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-stone-500">{new Date(user.created_at).toLocaleDateString('zh-CN')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                                    <select 
                                        value={user.tier}
                                        onChange={(e) => handleTierChange(user.id, e.target.value)}
                                        className="bg-transparent border-b border-stone-300 text-xs py-1 focus:outline-none focus:border-[#9a2b2b] cursor-pointer hover:bg-stone-50"
                                    >
                                        <option value="free">普通用户 (Free)</option>
                                        <option value="vip">会员 (VIP)</option>
                                        <option value="svip">至尊 (SVIP)</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
