'use client';

import { useState } from 'react';
import { CloseIcon } from './Icons';
import { useToast } from './Toast';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'tarot' | 'bazi';
    targetId?: number; 
}

const ThumbUpIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M7 10v12"></path>
        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
    </svg>
)

const ThumbDownIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M17 14V2"></path>
        <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
    </svg>
)

export default function FeedbackModal({ isOpen, onClose, type, targetId }: FeedbackModalProps) {
    const [score, setScore] = useState<number>(0); 
    const [content, setContent] = useState('');
    const { showToast } = useToast();

    if (!isOpen) return null;

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/feedback/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ type, related_history_id: targetId, score, content })
            });
            if (res.ok) {
                showToast('感谢您的反馈', 'success');
                onClose();
            } else {
                showToast('提交失败', 'error');
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-[#fffcf5] w-full max-w-sm rounded-sm shadow-2xl border border-[#dcd9cd] p-8 relative overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Background Texture */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("/rice-paper-2.png")' }}></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-[#9a2b2b]"></div>

                <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-[#9a2b2b] transition-colors">
                    <CloseIcon className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-bold text-ink mb-2 font-serif tracking-widest text-center">反馈工单</h3>
                <p className="text-xs text-stone-500 mb-8 text-center font-serif">您的建议是易朝成长的基石</p>
                
                <div className="flex justify-center gap-6 mb-8">
                    <button 
                        onClick={() => setScore(1)}
                        className={`group flex flex-col items-center gap-3 p-4 rounded-sm border transition-all w-28 ${score === 1 ? 'border-[#9a2b2b] bg-[#9a2b2b]/5 text-[#9a2b2b]' : 'border-stone-200 text-stone-400 hover:border-stone-300 hover:bg-stone-50'}`}
                    >
                        <ThumbUpIcon className={`w-8 h-8 transition-transform group-hover:scale-110 ${score === 1 ? 'fill-current' : ''}`} />
                        <span className="text-xs font-bold tracking-widest">神准</span>
                    </button>
                    <button 
                        onClick={() => setScore(-1)}
                        className={`group flex flex-col items-center gap-3 p-4 rounded-sm border transition-all w-28 ${score === -1 ? 'border-stone-600 bg-stone-100 text-stone-600' : 'border-stone-200 text-stone-400 hover:border-stone-300 hover:bg-stone-50'}`}
                    >
                        <ThumbDownIcon className={`w-8 h-8 transition-transform group-hover:scale-110 ${score === -1 ? 'fill-current' : ''}`} />
                        <span className="text-xs font-bold tracking-widest">一般</span>
                    </button>
                </div>

                <textarea 
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="请详细描述您的问题或建议..."
                    className="w-full bg-transparent border-b border-stone-300 text-ink placeholder:text-stone-300 focus:outline-none focus:border-[#9a2b2b] resize-none h-24 mb-8 text-sm font-serif leading-relaxed"
                />

                <button 
                    onClick={handleSubmit} 
                    disabled={score === 0 && !content} 
                    className="btn-seal w-full py-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                    提交反馈
                </button>
            </div>
        </div>
    );
}
