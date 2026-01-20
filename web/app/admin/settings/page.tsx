'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';

export default function AdminSettings() {
    const [settings, setSettings] = useState<any[]>([]);
    const { showToast } = useToast();

    const fetchSettings = () => {
        const token = localStorage.getItem('token');
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/settings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(setSettings)
        .catch(console.error);
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleUpdate = async (key: string, value: string) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ key, value })
            });
            if (res.ok) {
                showToast('配置已保存', 'success');
            } else {
                showToast('保存失败', 'error');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <h2 className="text-2xl font-bold text-ink font-serif tracking-wider">系统参数配置</h2>
                <div className="flex gap-2">
                    <button className="px-4 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-sm transition-colors" onClick={fetchSettings}>刷新</button>
                </div>
            </div>
            
            <div className="ink-card p-8 md:p-10 space-y-8 bg-[#fffcf5]">
                {settings.map((setting) => (
                    <div key={setting.key} className="group">
                        <div className="flex justify-between items-baseline mb-2">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">{setting.key}</label>
                            <span className="text-[10px] text-stone-400 bg-stone-50 px-2 py-0.5 rounded">{setting.description}</span>
                        </div>
                        <div className="relative">
                            <input 
                                type="text" 
                                defaultValue={setting.value}
                                onBlur={(e) => {
                                    if (e.target.value !== setting.value) {
                                        handleUpdate(setting.key, e.target.value);
                                    }
                                }}
                                className="w-full bg-transparent border-b-2 border-stone-200 py-3 text-sm text-ink font-mono focus:outline-none focus:border-[#9a2b2b] transition-all placeholder:text-stone-300"
                                placeholder="未配置"
                            />
                            <div className="absolute right-0 bottom-3 text-[10px] text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                点击编辑，失焦自动保存
                            </div>
                        </div>
                    </div>
                ))}
                
                {settings.length === 0 && (
                    <div className="text-center py-12 text-stone-400 text-sm">
                        暂无系统配置项
                    </div>
                )}
            </div>
        </div>
    );
}
