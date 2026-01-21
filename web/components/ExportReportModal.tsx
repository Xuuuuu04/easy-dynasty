'use client';

import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/components/Toast';
import { preprocessMarkdown } from '@/utils/markdown';
import type { DrawnCard } from '@/types/tarot';

interface ExportReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'tarot' | 'bazi';
    data: any; // Flexible data based on type
    userName?: string;
}

// Explicit HEX palettes to avoid oklch issues in html2canvas + Tailwind v4
const PALETTE = {
    ink: {
        bg: '#f5f5f0',
        textMain: '#1c1917',
        textSub: '#44403c',
        textMuted: '#78716c',
        textFaint: '#a8a29e',
        accent: '#9a2b2b',
        border: '#e7e5e4',
        cardBg: '#fffcf5',
        white: '#ffffff'
    },
    mystic: {
        bg: '#1c1917',
        textMain: '#ffffff',
        textSub: '#e7e5e4',
        textMuted: '#a8a29e',
        textFaint: '#57534e',
        accent: '#f59e0b',
        border: 'rgba(255, 255, 255, 0.2)',
        cardBg: 'rgba(255, 255, 255, 0.05)',
        white: '#ffffff'
    }
};

export default function ExportReportModal({ isOpen, onClose, type, data, userName }: ExportReportModalProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [template, setTemplate] = useState<'ink' | 'mystic'>('ink');
    const [hidePrivateInfo, setHidePrivateInfo] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();

    if (!isOpen) return null;

    const colors = PALETTE[template];

    const handleExport = async (format: 'image' | 'pdf') => {
        if (!reportRef.current) return;
        setIsGenerating(true);

        try {
            await document.fonts.ready;
            
            // Force strict styling for capture
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: colors.bg,
                logging: false,
                onclone: (clonedDoc) => {
                    const el = clonedDoc.getElementById('export-container');
                    if (el) {
                        // Ensure background is properly set in the clone
                        el.style.backgroundColor = colors.bg;
                        el.style.backgroundImage = template === 'ink' ? 'url("/rice-paper-2.png")' : `linear-gradient(to bottom, ${colors.bg}, #292524)`;
                    }
                }
            });

            if (format === 'image') {
                const link = document.createElement('a');
                link.download = `EasyDynasty_${type}_${new Date().getTime()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                showToast('图片导出成功', 'success');
            } else {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'px',
                    format: [canvas.width / 2, canvas.height / 2]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
                pdf.save(`EasyDynasty_${type}_${new Date().getTime()}.pdf`);
                showToast('PDF 导出成功', 'success');
            }
        } catch (error) {
            console.error(error);
            showToast('导出失败，请重试', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Components with Inline Styles ---

    const Watermark = () => (
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden" style={{ opacity: 0.03 }}>
            <div className="font-serif rotate-[-30deg] whitespace-nowrap" style={{ fontSize: '8rem', color: colors.textMain }}>EasyDynasty 易 · 朝</div>
        </div>
    );

    const Footer = () => (
        <div className="mt-12 pt-6 text-center space-y-2" style={{ borderTop: `1px solid ${colors.border}` }}>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.accent }}>
                EasyDynasty · 易朝
            </div>
            <div className="text-[10px]" style={{ color: colors.textMuted }}>
                体验更多神秘学探索，请访问 <span className="underline decoration-1 underline-offset-2">https://easydynasty.oyemoye.top</span>
            </div>
            <div className="text-[9px] px-8 scale-90" style={{ color: colors.textFaint }}>
                免责声明：本报告基于命理/塔罗学理生成，内容仅供娱乐与参考。命运始终掌握在自己手中，请理性看待，积极面对生活。
            </div>
        </div>
    );

    const TarotContent = () => (
        <div className="space-y-8 relative z-10">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="inline-block px-4 py-1 border-b-2 text-xs font-bold tracking-[0.3em] uppercase" style={{ borderColor: colors.accent, color: colors.accent }}>
                    Tarot Reading
                </div>
                <h2 className="text-3xl font-display font-bold" style={{ color: colors.textMain }}>塔罗启示录</h2>
                <div className="text-xs" style={{ color: colors.textMuted }}>
                    {new Date().toLocaleDateString('zh-CN')} · {data.spreadName}
                </div>
            </div>

            {/* Question */}
            <div className="p-6 rounded-sm border text-center" style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
                <div className="text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: colors.textFaint }}>Question</div>
                <div className="text-lg font-serif" style={{ color: colors.textMain }}>“{data.question}”</div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-3 gap-4">
                {data.drawnCards.map((card: DrawnCard, idx: number) => (
                    <div key={idx} className="flex flex-col items-center gap-2">
                        <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-md border" style={{ borderColor: colors.border }}>
                            <img 
                                src={`/cards/${card.card.id}.jpg`} 
                                alt={card.card.name} 
                                className={`w-full h-full object-cover ${card.isReversed ? 'rotate-180' : ''}`}
                            />
                        </div>
                        <div className="text-center">
                            <div className="text-xs font-bold" style={{ color: colors.textMain }}>{card.card.name}</div>
                            <div className="text-[9px] scale-90" style={{ color: card.isReversed ? colors.accent : '#059669' }}>
                                {card.isReversed ? '逆位 (Reversed)' : '正位 (Upright)'}
                            </div>
                            <div className="text-[9px] mt-1" style={{ color: colors.textMuted }}>{card.position.name}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Analysis */}
            <div className="space-y-4 text-left">
                <div className="text-xs font-bold uppercase tracking-widest border-b pb-1" style={{ borderColor: colors.border, color: colors.textFaint }}>
                    AI Interpretation
                </div>
                <div className="prose prose-sm max-w-none font-serif leading-relaxed whitespace-pre-wrap text-justify text-[11px] md:text-xs" style={{ color: colors.textSub }}>
                    {preprocessMarkdown(data.analysis.replace(/[#*`]/g, ''))}
                </div>
            </div>
        </div>
    );

    const BaziContent = () => (
        <div className="space-y-8 relative z-10">
             {/* Header */}
             <div className="text-center space-y-2">
                <div className="inline-block px-4 py-1 border-b-2 text-xs font-bold tracking-[0.3em] uppercase" style={{ borderColor: colors.accent, color: colors.accent }}>
                    Bazi Analysis
                </div>
                <h2 className="text-3xl font-display font-bold" style={{ color: colors.textMain }}>八字命理 · 深度批注</h2>
                <div className="text-xs" style={{ color: colors.textMuted }}>
                    {new Date().toLocaleDateString('zh-CN')} · 易朝 AI
                </div>
            </div>

            {/* Chart */}
            {!hidePrivateInfo && (
                <div className="grid grid-cols-4 gap-2 border-y-2 py-4" style={{ borderColor: colors.textMain }}>
                    {['年柱', '月柱', '日柱', '时柱'].map((title, i) => {
                        const pillars = [data.chart.year_pillar, data.chart.month_pillar, data.chart.day_pillar, data.chart.hour_pillar];
                        const p = pillars[i];
                        // Helper for wuxing colors
                        const getWuXingColor = (w: string) => {
                            if (w === '火') return '#b91c1c';
                            if (w === '水') return '#1d4ed8';
                            if (w === '木') return '#047857';
                            if (w === '金') return '#d97706';
                            return colors.textMuted;
                        };

                        return (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <span className="text-[10px] font-bold" style={{ color: colors.textFaint }}>{title}</span>
                                <div className="text-2xl font-bold font-serif flex flex-col items-center leading-none gap-1">
                                    <span style={{ color: getWuXingColor(p.gan_wuxing) }}>{p.gan}</span>
                                    <span style={{ color: getWuXingColor(p.zhi_wuxing) }}>{p.zhi}</span>
                                </div>
                                <div className="flex flex-col gap-0.5 items-center">
                                    {p.shensha.slice(0,2).map((s:string, idx:number) => (
                                        <span key={idx} className="text-[8px] border px-1 rounded-full" style={{ borderColor: colors.border, color: colors.textMuted }}>{s}</span>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* User Info */}
            <div className="flex justify-center gap-8 text-xs border-b pb-4" style={{ borderColor: colors.border, color: colors.textSub }}>
                <span>性别: {data.gender === 'male' ? '乾造 (男)' : '坤造 (女)'}</span>
                {!hidePrivateInfo && <span>生辰: {data.solarDate}</span>}
                {hidePrivateInfo && <span>生辰: [已隐藏]</span>}
            </div>

            {/* Analysis */}
            <div className="space-y-4 text-left">
                <div className="text-xs font-bold uppercase tracking-widest border-b pb-1" style={{ borderColor: colors.border, color: colors.textFaint }}>
                    大师批语
                </div>
                <div className="prose prose-sm max-w-none font-serif leading-relaxed whitespace-pre-wrap text-justify text-[11px] md:text-xs" style={{ color: colors.textSub }}>
                     {preprocessMarkdown(data.analysis.replace(/[#*`]/g, ''))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex overflow-hidden">
                
                {/* Left: Controls - Keep Tailwind here as it's not exported */}
                <div className="w-64 bg-stone-50 border-r border-stone-200 p-6 flex flex-col gap-6 shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-ink mb-1">导出报告</h3>
                        <p className="text-xs text-stone-500">生成精美的命理分析卡片</p>
                    </div>

                    {type === 'tarot' && (
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-stone-400 uppercase">选择风格</label>
                            <div className="grid grid-cols-1 gap-2">
                                <button 
                                    onClick={() => setTemplate('ink')}
                                    className={`px-4 py-3 text-sm border rounded-md text-left transition-all flex items-center justify-between ${template === 'ink' ? 'border-[#9a2b2b] bg-[#fffcf5] text-[#9a2b2b]' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}
                                >
                                    <span>清风水墨</span>
                                    {template === 'ink' && <span className="w-2 h-2 bg-[#9a2b2b] rounded-full"></span>}
                                </button>
                                <button 
                                    onClick={() => setTemplate('mystic')}
                                    className={`px-4 py-3 text-sm border rounded-md text-left transition-all flex items-center justify-between ${template === 'mystic' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}
                                >
                                    <span>紫金流光</span>
                                    {template === 'mystic' && <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>}
                                </button>
                            </div>
                        </div>
                    )}

                    {type === 'bazi' && (
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-stone-400 uppercase">隐私设置</label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${hidePrivateInfo ? 'bg-[#9a2b2b] border-[#9a2b2b]' : 'border-stone-300 bg-white group-hover:border-stone-400'}`}>
                                    {hidePrivateInfo && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <input type="checkbox" className="hidden" checked={hidePrivateInfo} onChange={(e) => setHidePrivateInfo(e.target.checked)} />
                                <span className="text-sm text-stone-700">隐藏生辰八字</span>
                            </label>
                            <p className="text-[10px] text-stone-400 leading-relaxed">
                                开启后，导出图片将不会显示具体的出生时间和完整的四柱信息，仅保留分析结果。
                            </p>
                        </div>
                    )}

                    <div className="mt-auto space-y-3">
                        <button 
                            onClick={() => handleExport('image')}
                            disabled={isGenerating}
                            className="w-full py-3 bg-[#9a2b2b] hover:bg-[#852222] text-white font-bold tracking-widest rounded-sm shadow-md transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {isGenerating ? '生成中...' : '保存为图片'}
                        </button>
                        <button onClick={onClose} className="w-full py-2 text-xs text-stone-400 hover:text-stone-600">取消</button>
                    </div>
                </div>

                {/* Right: Preview Area */}
                <div className="flex-1 bg-stone-200/50 overflow-auto p-8 flex justify-center custom-scrollbar">
                    <div className="relative shadow-2xl origin-top transition-transform duration-500" style={{ transform: 'scale(0.9)' }}>
                        <div 
                            id="export-container"
                            ref={reportRef}
                            className="w-[500px] min-h-[800px] p-12 relative flex flex-col"
                            style={{ 
                                backgroundColor: colors.bg,
                                color: colors.textMain,
                                backgroundImage: template === 'ink' ? 'url("/rice-paper-2.png")' : `linear-gradient(to bottom, ${colors.bg}, #292524)`,
                                backgroundSize: 'cover',
                                fontFamily: '"Times New Roman", Times, serif', // Force standard serif for better canvas compatibility
                                gap: '2rem' // Explicit gap for flex layout
                            }}
                        >
                            {/* Border Decoration */}
                            <div className="absolute inset-4 border-2 pointer-events-none z-20" style={{ borderColor: colors.accent, opacity: 0.2 }}></div>
                            <div className="absolute inset-5 border pointer-events-none z-20" style={{ borderColor: colors.accent, opacity: 0.1 }}></div>

                            <Watermark />

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {type === 'tarot' ? <TarotContent /> : <BaziContent />}
                            </div>

                            <Footer />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
