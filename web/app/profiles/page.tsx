'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { ArchiveIcon, CloseIcon } from '@/components/Icons';

interface Profile {
    id: number;
    name: string;
    gender: string;
    relation: string;
    birth_year: number;
    birth_month: number;
    birth_day: number;
    birth_hour: number;
    birth_minute: number;
    birth_place: string;
    is_true_solar_time: boolean;
}

export default function ProfilesPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '', gender: 'male', relation: '亲友',
        date: '', time: '', place: '', isTrueSolarTime: false
    });
    
    const router = useRouter();
    const { showToast } = useToast();

    const fetchProfiles = async () => {
        const token = localStorage.getItem('token');
        if (!token) return router.push('/');
        
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/profiles/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setProfiles(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfiles(); }, []);

    const handleSubmit = async () => {
        if (!formData.name || !formData.date || !formData.time) {
            showToast('请填写完整信息', 'error');
            return;
        }
        
        const [year, month, day] = formData.date.split('-').map(Number);
        const [hour, minute] = formData.time.split(':').map(Number);
        
        const payload = {
            name: formData.name,
            gender: formData.gender,
            relation: formData.relation,
            birth_year: year, birth_month: month, birth_day: day,
            birth_hour: hour, birth_minute: minute,
            birth_place: formData.place,
            is_true_solar_time: formData.isTrueSolarTime
        };

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/profiles/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                showToast('档案添加成功', 'success');
                setIsModalOpen(false);
                fetchProfiles();
                setFormData({ name: '', gender: 'male', relation: '亲友', date: '', time: '', place: '', isTrueSolarTime: false });
            } else {
                showToast('添加失败', 'error');
            }
        } catch (e) {
            showToast('网络错误', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('确定删除此档案吗？')) return;
        const token = localStorage.getItem('token');
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/profiles/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setProfiles(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="min-h-screen bg-[#f5f5f0] pt-24 pb-12 px-4 font-serif text-stone-800">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold text-ink flex items-center gap-3">
                            <ArchiveIcon className="w-8 h-8 text-[#9a2b2b]" />
                            亲友档案
                        </h1>
                        <p className="text-stone-500 text-sm mt-2">管理您与亲友的命理数据</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="btn-seal px-6 py-2 shadow-md flex items-center gap-2">
                        <span>+ 新增档案</span>
                    </button>
                </div>

                {loading ? (
                    <div className="text-center text-stone-400 py-20">正在读取卷宗...</div>
                ) : profiles.length === 0 ? (
                    <div className="ink-card p-12 text-center text-stone-400">暂无档案，请点击右上角添加。</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                        {profiles.map(p => (
                            <div key={p.id} className="ink-card p-6 relative group hover:border-[#9a2b2b]/30 transition-colors">
                                <button onClick={() => handleDelete(p.id)} className="absolute top-4 right-4 text-stone-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                                    <CloseIcon className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-2 ${p.gender === 'male' ? 'border-stone-800 bg-stone-800 text-[#f5f5f0]' : 'border-[#9a2b2b] bg-[#9a2b2b] text-[#f5f5f0]'}`}>
                                        {p.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-ink">{p.name}</h3>
                                        <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{p.relation}</span>
                                    </div>
                                </div>
                                <div className="space-y-1 text-sm text-stone-600">
                                    <p>生辰: {p.birth_year}/{p.birth_month}/{p.birth_day} {String(p.birth_hour).padStart(2,'0')}:{String(p.birth_minute).padStart(2,'0')}</p>
                                    <p>地点: {p.birth_place || '未知'}</p>
                                    <p>真太阳时: {p.is_true_solar_time ? '是' : '否'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#fffcf5] w-full max-w-md rounded-sm shadow-2xl border border-stone-200 p-8 relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-bold text-ink mb-6 text-center border-b border-stone-200 pb-4">新增档案</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-stone-400 uppercase">姓名</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="ink-input w-full mt-1" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-stone-400 uppercase">关系</label>
                                    <input type="text" value={formData.relation} onChange={e => setFormData({...formData, relation: e.target.value})} className="ink-input w-full mt-1" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={() => setFormData({...formData, gender: 'male'})} />
                                    <span className="text-sm">男命</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={() => setFormData({...formData, gender: 'female'})} />
                                    <span className="text-sm">女命</span>
                                </label>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-stone-400 uppercase">日期</label>
                                    <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="ink-input w-full mt-1" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-stone-400 uppercase">时间</label>
                                    <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="ink-input w-full mt-1" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-stone-400 uppercase">出生地点</label>
                                <input type="text" value={formData.place} onChange={e => setFormData({...formData, place: e.target.value})} className="ink-input w-full mt-1" placeholder="城市/区县" />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input type="checkbox" checked={formData.isTrueSolarTime} onChange={e => setFormData({...formData, isTrueSolarTime: e.target.checked})} />
                                <span className="text-sm text-stone-600">使用真太阳时</span>
                            </div>
                            <button onClick={handleSubmit} className="btn-seal w-full py-3 mt-4 text-lg shadow-md">保存档案</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
