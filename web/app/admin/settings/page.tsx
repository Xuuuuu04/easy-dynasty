'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';

export default function AdminSettings() {
    const [settings, setSettings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/settings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(setSettings)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, []);

    const handleSave = async (key: string, value: string) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ key, value })
        });
        if (res.ok) showToast(`保存成功: ${key}`, 'success');
        else showToast('保存失败', 'error');
    };

    if (loading) return <div className="text-stone-400 font-serif">正在读取天机配置...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-ink font-serif tracking-widest border-b border-stone-200 pb-4">系统参数设置</h2>
            
            <div className="grid grid-cols-1 gap-6">
                {settings.map((s) => (
                    <div key={s.key} className="ink-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-stone-800 tracking-wide uppercase">{s.key}</h3>
                            <p className="text-xs text-stone-400 mt-1">{s.description || '无描述'}</p>
                            <span className="text-[9px] text-[#9a2b2b] bg-red-50 px-1.5 py-0.5 rounded mt-2 inline-block uppercase font-bold">{s.category || 'General'}</span>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-2/3">
                            <input 
                                type="text" 
                                defaultValue={s.value} 
                                onBlur={(e) => handleSave(s.key, e.target.value)}
                                className="flex-1 ink-input !py-2 !text-sm font-mono"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}