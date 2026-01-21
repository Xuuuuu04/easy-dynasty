'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { MessageIcon, CloseIcon } from '@/components/Icons';

interface FeedbackRecord {
    id: number;
    type: string;
    score: number;
    content: string;
    admin_reply: string | null;
    replied_at: string | null;
    created_at: string;
    is_read_by_user: boolean;
}

export default function FeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [type, setType] = useState<'tarot' | 'bazi'>('tarot');
    const [submitting, setSubmitting] = useState(false);
    
    const router = useRouter();
    const { showToast } = useToast();

    const fetchMyFeedbacks = async () => {
        const token = localStorage.getItem('token');
        if (!token) return router.push('/');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/feedback/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setFeedbacks(await res.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMyFeedbacks(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        
        setSubmitting(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/feedback/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ type, score: 0, content })
            });
            if (res.ok) {
                showToast('工单已提交，我们会尽快回复', 'success');
                setContent('');
                fetchMyFeedbacks();
            }
        } catch (e) {
            showToast('提交失败', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f5f0] pt-24 pb-12 px-4 font-serif text-stone-800">
            <div className="max-w-4xl mx-auto space-y-12">
                
                {/* Header */}
                <div className="text-center animate-fade-in">
                    <h1 className="text-3xl font-bold text-ink flex items-center justify-center gap-3">
                        <MessageIcon className="w-8 h-8 text-[#9a2b2b]" />
                        反馈工单
                    </h1>
                    <p className="text-stone-500 text-sm mt-2">您的建议是易朝成长的基石</p>
                </div>

                {/* Submit Form */}
                <div className="ink-card p-6 md:p-8 bg-white border-stone-200 animate-slide-up">
                    <h2 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
                        <span className="w-1 h-4 bg-[#9a2b2b]"></span>
                        提交新建议
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-4 mb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="type" checked={type === 'tarot'} onChange={() => setType('tarot')} className="accent-[#9a2b2b]" />
                                <span className="text-sm">塔罗相关</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="type" checked={type === 'bazi'} onChange={() => setType('bazi')} className="accent-[#9a2b2b]" />
                                <span className="text-sm">八字相关</span>
                            </label>
                        </div>
                        <textarea 
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="请描述您遇到的问题或改进建议..."
                            className="ink-input w-full h-32 resize-none text-base"
                            required
                        />
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={submitting || !content.trim()}
                                className="btn-seal px-10 py-2.5 shadow-md disabled:opacity-50"
                            >
                                {submitting ? '提交中...' : '提交工单'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* History Tickets */}
                <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                        <span className="w-1 h-4 bg-stone-400"></span>
                        历史工单记录
                    </h2>
                    
                    {loading ? (
                        <div className="text-center py-12 text-stone-400">载入中...</div>
                    ) : feedbacks.length === 0 ? (
                        <div className="text-center py-12 text-stone-400 bg-stone-50 border border-dashed border-stone-200">暂无记录</div>
                    ) : (
                        <div className="space-y-4">
                            {feedbacks.map(fb => (
                                <div key={fb.id} className={`ink-card p-6 bg-white transition-all ${fb.admin_reply ? 'border-emerald-100' : 'border-stone-200'}`}>
                                    <div className="flex justify-between items-start mb-4 border-b border-stone-50 pb-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${fb.type === 'tarot' ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700'}`}>
                                                {fb.type}
                                            </span>
                                            <span className="text-[10px] text-stone-400 font-sans">
                                                {new Date(fb.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <span className={`text-[10px] font-bold ${fb.admin_reply ? 'text-emerald-600' : 'text-amber-600 animate-pulse'}`}>
                                            {fb.admin_reply ? '● 已回复' : '○ 待处理'}
                                        </span>
                                    </div>
                                    <p className="text-stone-700 text-sm leading-relaxed mb-4">{fb.content}</p>
                                    
                                    {fb.admin_reply && (
                                        <div className="bg-[#f5f5f0] p-4 rounded-sm border-l-4 border-emerald-500 mt-2">
                                            <p className="text-[10px] font-bold text-emerald-700 uppercase mb-1 tracking-widest">管理员回复：</p>
                                            <p className="text-sm text-stone-600 italic">“{fb.admin_reply}”</p>
                                            <p className="text-[9px] text-stone-400 mt-2 text-right">回复于 {new Date(fb.replied_at!).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
