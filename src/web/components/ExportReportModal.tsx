import { useState, useRef } from 'react';
import { domToPng } from 'modern-screenshot';
import jsPDF from 'jspdf';
import { useToast } from '@/components/Toast';
import { preprocessMarkdown } from '@/utils/markdown';
import SpreadLayout from './SpreadLayout';
import type { DrawnCard, Position } from '@/types/tarot';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Pillar {
    gan: string;
    zhi: string;
    gan_wuxing: string;
    zhi_wuxing: string;
    shensha: string[];
}

interface BaziChart {
    year_pillar: Pillar;
    month_pillar: Pillar;
    day_pillar: Pillar;
    hour_pillar: Pillar;
}

interface TarotExportData {
    question: string;
    spreadName: string;
    spreadId?: string;
    positions?: Position[];
    drawnCards: DrawnCard[];
    analysis: string;
}

interface BaziExportData {
    analysis: string;
    gender: 'male' | 'female';
    solarDate: string;
    chart: BaziChart;
}

type ExportReportModalProps =
    | { isOpen: boolean; onClose: () => void; type: 'tarot'; data: TarotExportData; userName?: string }
    | { isOpen: boolean; onClose: () => void; type: 'bazi'; data: BaziExportData; userName?: string };

type TemplateId = 'ink' | 'mystic' | 'royal' | 'minimal' | 'starry' | 'cyber';

function isTarotData(
    type: ExportReportModalProps['type'],
    data: TarotExportData | BaziExportData
): data is TarotExportData {
    return type === 'tarot';
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
        white: '#ffffff',
        labelBg: 'rgba(255, 255, 255, 0.95)',
        labelText: '#9a2b2b',
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
        white: '#ffffff',
        labelBg: 'rgba(20, 20, 20, 0.85)',
        labelText: '#f59e0b',
    },
    royal: {
        bg: '#2d1b1b',
        textMain: '#f5f5dc',
        textSub: '#d4c5b0',
        textMuted: '#a89076',
        textFaint: '#6b5746',
        accent: '#d4af37',
        border: 'rgba(212, 175, 55, 0.3)',
        cardBg: 'rgba(139, 69, 19, 0.2)',
        white: '#ffffff',
        labelBg: 'rgba(45, 27, 27, 0.9)',
        labelText: '#d4af37',
    },
    minimal: {
        bg: '#fafafa',
        textMain: '#2c2c2c',
        textSub: '#525252',
        textMuted: '#737373',
        textFaint: '#a3a3a3',
        accent: '#6366f1',
        border: '#e5e5e5',
        cardBg: '#ffffff',
        white: '#ffffff',
        labelBg: 'rgba(255, 255, 255, 0.95)',
        labelText: '#6366f1',
    },
    starry: {
        bg: '#0f0a1f',
        textMain: '#e0d7ff',
        textSub: '#c4b5fd',
        textMuted: '#9d87d8',
        textFaint: '#6b5b95',
        accent: '#a78bfa',
        border: 'rgba(167, 139, 250, 0.3)',
        cardBg: 'rgba(139, 92, 246, 0.1)',
        white: '#ffffff',
        labelBg: 'rgba(15, 10, 31, 0.85)',
        labelText: '#a78bfa',
    },
    cyber: {
        bg: '#0a0a0a',
        textMain: '#00ff9f',
        textSub: '#00d4aa',
        textMuted: '#00a896',
        textFaint: '#006d75',
        accent: '#ff006e',
        border: 'rgba(255, 0, 110, 0.4)',
        cardBg: 'rgba(0, 255, 159, 0.05)',
        white: '#ffffff',
        labelBg: 'rgba(10, 10, 10, 0.9)',
        labelText: '#ff006e',
    },
};

const STYLE_OPTIONS = [
    {
        id: 'ink',
        name: '清风水墨',
        bg: '#fffcf5',
        border: '#9a2b2b',
        text: '#9a2b2b',
        dot1: '#f5f5f0',
        dot2: '#9a2b2b',
        dot1Border: undefined,
    },
    {
        id: 'mystic',
        name: '紫金流光',
        bg: '#fffbeb',
        border: '#d97706',
        text: '#b45309',
        dot1: '#1c1917',
        dot2: '#f59e0b',
        dot1Border: undefined,
    },
    {
        id: 'royal',
        name: '古韵宫廷',
        bg: '#fefce8',
        border: '#ca8a04',
        text: '#a16207',
        dot1: '#2d1b1b',
        dot2: '#d4af37',
        dot1Border: undefined,
    },
    {
        id: 'minimal',
        name: '极简现代',
        bg: '#eef2ff',
        border: '#4f46e5',
        text: '#4338ca',
        dot1: '#fafafa',
        dot2: '#6366f1',
        dot1Border: '#e5e5e5',
    },
    {
        id: 'starry',
        name: '星空梦幻',
        bg: '#faf5ff',
        border: '#9333ea',
        text: '#7e22ce',
        dot1: '#0f0a1f',
        dot2: '#a78bfa',
        dot1Border: undefined,
    },
    {
        id: 'cyber',
        name: '暗夜赛博',
        bg: '#fdf2f8',
        border: '#db2777',
        text: '#be185d',
        dot1: '#0a0a0a',
        dot2: '#ff006e',
        dot1Border: undefined,
    },
] as const;

export default function ExportReportModal({
    isOpen,
    onClose,
    type,
    data,
}: ExportReportModalProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [template, setTemplate] = useState<TemplateId>('ink');
    const [hidePrivateInfo, setHidePrivateInfo] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();

    if (!isOpen) return null;

    const colors = PALETTE[template];
    const tarotData = isTarotData(type, data) ? data : null;
    const baziData = type === 'bazi' ? data : null;

    const handleExport = async (format: 'image' | 'pdf') => {
        if (!reportRef.current) return;
        setIsGenerating(true);

        try {
            await document.fonts.ready;

            // Use modern-screenshot which supports modern CSS color functions
            const dataUrl = await domToPng(reportRef.current, {
                scale: 2,
                backgroundColor: colors.bg,
                style: {
                    // Force sRGB color rendering
                    colorScheme: 'light',
                },
            });

            if (format === 'image') {
                const link = document.createElement('a');
                link.download = `EasyDynasty_${type}_${new Date().getTime()}.png`;
                link.href = dataUrl;
                link.click();
                showToast('图片导出成功', 'success');
            } else {
                // For PDF, we need to create an image first to get dimensions
                const img = new Image();
                img.src = dataUrl;
                await new Promise((resolve) => { img.onload = resolve; });

                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'px',
                    format: [img.width / 2, img.height / 2],
                });
                pdf.addImage(dataUrl, 'PNG', 0, 0, img.width / 2, img.height / 2);
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
        <div
            className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden"
            style={{ opacity: 0.03 }}
        >
            <div
                className="font-serif rotate-[-30deg] whitespace-nowrap"
                style={{ fontSize: '8rem', color: colors.textMain }}
            >
                EasyDynasty 易 · 朝
            </div>
        </div>
    );

    const Footer = () => (
        <div
            className="mt-12 pt-6 text-center space-y-3"
            style={{ borderTop: `1px solid ${colors.border}` }}
        >
            {/* Logo and Brand */}
            <div className="flex items-center justify-center gap-3">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: colors.accent }}
                >
                    <svg viewBox="0 0 100 100" className="w-6 h-6">
                        <g transform="translate(50, 50) scale(0.8) translate(-50, -50)">
                            <path
                                d="M30 25 H70 V45 H30 Z M30 35 H70"
                                fill="none"
                                stroke="white"
                                strokeWidth="7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M30 60 Q40 65 50 60 Q30 75 25 85 M60 55 Q70 65 75 80 M40 70 L60 70"
                                fill="none"
                                stroke="white"
                                strokeWidth="7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </g>
                    </svg>
                </div>
                <div className="flex flex-col items-start">
                    <div
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: colors.accent }}
                    >
                        易朝 · EasyDynasty
                    </div>
                    <div className="text-[9px]" style={{ color: colors.textMuted }}>
                        东方命理与塔罗启示
                    </div>
                </div>
            </div>
            <div className="text-[10px]" style={{ color: colors.textMuted }}>
                体验更多神秘学探索，请访问{' '}
                <span className="underline decoration-1 underline-offset-2">
                    https://tarot.oyemoye.top
                </span>
            </div>
            <div className="text-[9px] px-8 scale-90" style={{ color: colors.textFaint }}>
                免责声明：本报告基于命理/塔罗学理生成，内容仅供娱乐与参考。命运始终掌握在自己手中，请理性看待，积极面对生活。
            </div>
        </div>
    );

    const TarotContent = () => (
        <div className="space-y-8 relative z-10 w-full">
            {/* Header */}
            <div className="text-center space-y-3">
                {/* Logo */}
                <div className="flex justify-center mb-2">
                    <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: colors.accent }}
                    >
                        <svg viewBox="0 0 100 100" className="w-12 h-12">
                            <g transform="translate(50, 50) scale(0.8) translate(-50, -50)">
                                <path
                                    d="M30 25 H70 V45 H30 Z M30 35 H70"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M30 60 Q40 65 50 60 Q30 75 25 85 M60 55 Q70 65 75 80 M40 70 L60 70"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </g>
                        </svg>
                    </div>
                </div>
                <div
                    className="inline-block px-4 py-1 border-b-2 text-xs font-bold tracking-[0.3em] uppercase"
                    style={{ borderColor: colors.accent, color: colors.accent }}
                >
                    Tarot Reading
                </div>
                <h2 className="text-3xl font-display font-bold" style={{ color: colors.textMain }}>
                    塔罗启示录
                </h2>
                <div className="text-xs" style={{ color: colors.textMuted }}>
                    {new Date().toLocaleDateString('zh-CN')} · {tarotData?.spreadName}
                </div>
            </div>

            {/* Question */}
            <div
                className="p-6 rounded-sm border text-center max-w-2xl mx-auto"
                style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
            >
                <div
                    className="text-xs font-bold mb-2 uppercase tracking-widest"
                    style={{ color: colors.textFaint }}
                >
                    Question
                </div>
                <div className="text-lg font-serif" style={{ color: colors.textMain }}>
                    “{tarotData?.question}”
                </div>
            </div>

            {/* Layout - Scaled for fit if needed */}
            <div className="w-full flex justify-center py-4 scale-90 origin-top overflow-x-auto custom-scrollbar">
                <div className="pointer-events-none">
                    {' '}
                    {/* Disable interaction */}
                    {tarotData?.spreadId && tarotData.positions ? (
                        <SpreadLayout
                            spreadId={tarotData.spreadId}
                            positions={tarotData.positions}
                            drawnCards={tarotData.drawnCards}
                            onPositionClick={() => { }}
                            canDrawAtPosition={() => false}
                            isDrawing={false}
                            drawingPositionId={null}
                            labelBg={colors.labelBg}
                            labelText={colors.labelText}
                            labelBorder={colors.border}
                        />
                    ) : (
                        <div className="text-center text-xs" style={{ color: '#ef4444' }}>
                            Layout Data Missing
                        </div>
                    )}
                </div>
            </div>

            {/* Analysis */}
            <div className="space-y-4 text-left max-w-4xl mx-auto px-8">
                <div
                    className="text-xs font-bold uppercase tracking-widest border-b pb-1"
                    style={{ borderColor: colors.border, color: colors.textFaint }}
                >
                    AI Interpretation
                </div>
                <div
                    className="prose prose-sm max-w-none font-serif leading-relaxed text-justify text-[11px] md:text-xs"
                    style={{ color: colors.textSub }}
                >
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ children }) => (
                                <p className="mb-2 whitespace-pre-wrap">{children}</p>
                            ),
                            strong: ({ children }) => (
                                <strong style={{ color: colors.textMain }}>{children}</strong>
                            ),
                            h1: ({ children }) => (
                                <h1
                                    className="text-xl font-bold mt-4 mb-2"
                                    style={{ color: colors.textMain }}
                                >
                                    {children}
                                </h1>
                            ),
                            h2: ({ children }) => (
                                <h2
                                    className="text-lg font-bold mt-3 mb-2"
                                    style={{ color: colors.textMain }}
                                >
                                    {children}
                                </h2>
                            ),
                            h3: ({ children }) => (
                                <h3
                                    className="text-md font-bold mt-2 mb-1"
                                    style={{ color: colors.textMain }}
                                >
                                    {children}
                                </h3>
                            ),
                            h4: ({ children }) => (
                                <h4
                                    className="text-sm font-bold mt-2 mb-1"
                                    style={{ color: colors.textMain }}
                                >
                                    {children}
                                </h4>
                            ),
                            blockquote: ({ children }) => (
                                <blockquote
                                    style={{ borderColor: colors.accent, color: colors.textMain }}
                                    className="border-l-2 pl-4 italic my-2"
                                >
                                    {children}
                                </blockquote>
                            ),
                            table: ({ children }) => (
                                <table className="w-full text-left border-collapse my-2">
                                    {children}
                                </table>
                            ),
                            th: ({ children }) => (
                                <th
                                    className="border-b font-bold p-1"
                                    style={{ borderColor: colors.border, color: colors.textMain }}
                                >
                                    {children}
                                </th>
                            ),
                            td: ({ children }) => (
                                <td className="border-b p-1" style={{ borderColor: colors.border }}>
                                    {children}
                                </td>
                            ),
                            ul: ({ children }) => (
                                <ul className="list-disc pl-5 mb-2">{children}</ul>
                            ),
                            ol: ({ children }) => (
                                <ol className="list-decimal pl-5 mb-2">{children}</ol>
                            ),
                            li: ({ children }) => (
                                <li className="mb-1" style={{ color: colors.textSub }}>
                                    {children}
                                </li>
                            ),
                        }}
                    >
                        {preprocessMarkdown(tarotData?.analysis || '')}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );

    const BaziContent = () => (
        <div className="space-y-8 relative z-10">
            {/* Header */}
            <div className="text-center space-y-3">
                {/* Logo */}
                <div className="flex justify-center mb-2">
                    <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: colors.accent }}
                    >
                        <svg viewBox="0 0 100 100" className="w-12 h-12">
                            <g transform="translate(50, 50) scale(0.8) translate(-50, -50)">
                                <path
                                    d="M30 25 H70 V45 H30 Z M30 35 H70"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M30 60 Q40 65 50 60 Q30 75 25 85 M60 55 Q70 65 75 80 M40 70 L60 70"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </g>
                        </svg>
                    </div>
                </div>
                <div
                    className="inline-block px-4 py-1 border-b-2 text-xs font-bold tracking-[0.3em] uppercase"
                    style={{ borderColor: colors.accent, color: colors.accent }}
                >
                    Bazi Analysis
                </div>
                <h2 className="text-3xl font-display font-bold" style={{ color: colors.textMain }}>
                    八字命理 · 深度批注
                </h2>
                <div className="text-xs" style={{ color: colors.textMuted }}>
                    {new Date().toLocaleDateString('zh-CN')} · 易朝 AI
                </div>
            </div>

            {/* Chart */}
            {!hidePrivateInfo && (
                <div
                    className="grid grid-cols-4 gap-2 border-y-2 py-4"
                    style={{ borderColor: colors.textMain }}
                >
                    {['年柱', '月柱', '日柱', '时柱'].map((title, i) => {
                        const pillars = [
                            baziData?.chart.year_pillar,
                            baziData?.chart.month_pillar,
                            baziData?.chart.day_pillar,
                            baziData?.chart.hour_pillar,
                        ];
                        const p = pillars[i];
                        if (!p) return null;
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
                                <span
                                    className="text-[10px] font-bold"
                                    style={{ color: colors.textFaint }}
                                >
                                    {title}
                                </span>
                                <div className="text-2xl font-bold font-serif flex flex-col items-center leading-none gap-1">
                                    <span style={{ color: getWuXingColor(p.gan_wuxing) }}>
                                        {p.gan}
                                    </span>
                                    <span style={{ color: getWuXingColor(p.zhi_wuxing) }}>
                                        {p.zhi}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-0.5 items-center">
                                    {p.shensha.slice(0, 2).map((s: string, idx: number) => (
                                        <span
                                            key={idx}
                                            className="text-[8px] border px-1 rounded-full"
                                            style={{
                                                borderColor: colors.border,
                                                color: colors.textMuted,
                                            }}
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* User Info */}
            <div
                className="flex justify-center gap-8 text-xs border-b pb-4"
                style={{ borderColor: colors.border, color: colors.textSub }}
            >
                <span>性别: {baziData?.gender === 'male' ? '乾造 (男)' : '坤造 (女)'}</span>
                {!hidePrivateInfo && <span>生辰: {baziData?.solarDate}</span>}
                {hidePrivateInfo && <span>生辰: [已隐藏]</span>}
            </div>

            {/* Analysis */}
            <div className="space-y-4 text-left">
                <div
                    className="text-xs font-bold uppercase tracking-widest border-b pb-1"
                    style={{ borderColor: colors.border, color: colors.textFaint }}
                >
                    大师批语
                </div>
                <div
                    className="prose prose-sm max-w-none font-serif leading-relaxed text-justify text-[11px] md:text-xs"
                    style={{ color: colors.textSub }}
                >
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ children }) => (
                                <p className="mb-2 whitespace-pre-wrap">{children}</p>
                            ),
                            strong: ({ children }) => (
                                <strong style={{ color: colors.textMain }}>{children}</strong>
                            ),
                            h1: ({ children }) => (
                                <h1
                                    className="text-xl font-bold mt-4 mb-2"
                                    style={{ color: colors.textMain }}
                                >
                                    {children}
                                </h1>
                            ),
                            h2: ({ children }) => (
                                <h2
                                    className="text-lg font-bold mt-3 mb-2"
                                    style={{ color: colors.textMain }}
                                >
                                    {children}
                                </h2>
                            ),
                            h3: ({ children }) => (
                                <h3
                                    className="text-md font-bold mt-2 mb-1"
                                    style={{ color: colors.textMain }}
                                >
                                    {children}
                                </h3>
                            ),
                            h4: ({ children }) => (
                                <h4
                                    className="text-sm font-bold mt-2 mb-1"
                                    style={{ color: colors.textMain }}
                                >
                                    {children}
                                </h4>
                            ),
                            blockquote: ({ children }) => (
                                <blockquote
                                    style={{ borderColor: colors.accent, color: colors.textMain }}
                                    className="border-l-2 pl-4 italic my-2"
                                >
                                    {children}
                                </blockquote>
                            ),
                            table: ({ children }) => (
                                <table className="w-full text-left border-collapse my-2">
                                    {children}
                                </table>
                            ),
                            th: ({ children }) => (
                                <th
                                    className="border-b font-bold p-1"
                                    style={{ borderColor: colors.border, color: colors.textMain }}
                                >
                                    {children}
                                </th>
                            ),
                            td: ({ children }) => (
                                <td className="border-b p-1" style={{ borderColor: colors.border }}>
                                    {children}
                                </td>
                            ),
                            ul: ({ children }) => (
                                <ul className="list-disc pl-5 mb-2">{children}</ul>
                            ),
                            ol: ({ children }) => (
                                <ol className="list-decimal pl-5 mb-2">{children}</ol>
                            ),
                            li: ({ children }) => (
                                <li className="mb-1" style={{ color: colors.textSub }}>
                                    {children}
                                </li>
                            ),
                        }}
                    >
                        {preprocessMarkdown(baziData?.analysis || '')}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white md:rounded-lg shadow-2xl w-full max-w-6xl h-full md:h-[90vh] flex flex-col md:flex-row overflow-hidden">
                {/* Left: Controls - Keep Tailwind here as it's not exported */}
                <div className="w-full md:w-80 bg-card-bg border-b md:border-b-0 md:border-r border-border p-4 md:p-6 flex flex-col gap-4 md:gap-6 shrink-0 h-auto max-h-[40vh] md:max-h-full overflow-y-auto z-10">
                    <div className="flex justify-between items-center md:block">
                        <div>
                            <h3 className="text-lg font-bold text-text-main mb-1">导出报告</h3>
                            <p className="text-xs text-text-muted">生成精美的命理分析卡片</p>
                        </div>
                        <button onClick={onClose} className="md:hidden text-text-muted hover:text-text-main">
                            ✕
                        </button>
                    </div>

                    {type === 'tarot' && (
                        <div className="space-y-3">
                            <label
                                className="text-xs font-bold uppercase hidden md:block text-text-muted"
                            >
                                选择风格
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3">
                                {STYLE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setTemplate(opt.id as TemplateId)}
                                        className="px-3 py-2 md:px-4 md:py-3.5 text-xs md:text-sm border-2 rounded-lg md:rounded-xl text-left transition-all flex items-center justify-between group hover:shadow-md"
                                        style={{
                                            borderColor:
                                                template === opt.id ? opt.border : 'var(--border)',
                                            backgroundColor:
                                                template === opt.id ? opt.bg : 'var(--card-bg)',
                                            color: template === opt.id ? opt.text : 'var(--text-sub)',
                                        }}
                                    >
                                        <span className="font-bold">{opt.name}</span>
                                        <div className="flex gap-1.5 md:gap-1.5 hidden md:flex">
                                            <div
                                                className="w-4 h-4 md:w-5 md:h-5 rounded-full shadow-sm"
                                                style={{
                                                    backgroundColor: opt.dot1,
                                                    border: opt.dot1Border
                                                        ? `1px solid ${opt.dot1Border}`
                                                        : 'none',
                                                }}
                                            ></div>
                                            <div
                                                className="w-4 h-4 md:w-5 md:h-5 rounded-full shadow-sm"
                                                style={{ backgroundColor: opt.dot2 }}
                                            ></div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {type === 'bazi' && (
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-text-muted uppercase hidden md:block">
                                隐私设置
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div
                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${hidePrivateInfo ? 'bg-accent-main border-accent-main' : 'border-border bg-card-bg group-hover:border-text-muted'}`}
                                >
                                    {hidePrivateInfo && (
                                        <svg
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={hidePrivateInfo}
                                    onChange={(e) => setHidePrivateInfo(e.target.checked)}
                                />
                                <span className="text-sm text-text-sub">隐藏生辰八字</span>
                            </label>
                            <p className="text-[10px] text-text-muted leading-relaxed hidden md:block">
                                开启后，导出图片将不会显示具体的出生时间和完整的四柱信息，仅保留分析结果。
                            </p>
                        </div>
                    )}

                    <div className="mt-auto space-y-3 pt-4 border-t border-border md:border-0 md:pt-0">
                        <button
                            onClick={() => handleExport('image')}
                            disabled={isGenerating}
                            className="w-full py-2.5 md:py-3 bg-accent-main hover:bg-accent-light text-white font-bold tracking-widest rounded-sm shadow-md transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                            {isGenerating ? '生成中...' : '保存为图片'}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-2 text-xs text-text-muted hover:text-text-main hidden md:block"
                        >
                            取消
                        </button>
                    </div>
                </div>

                {/* Right: Preview Area */}
                <div className="flex-1 bg-bg-main overflow-auto p-4 md:p-8 flex justify-center custom-scrollbar">
                    <div
                        className="relative shadow-2xl origin-top transition-transform duration-500 scale-[0.35] md:scale-[0.6] lg:scale-[0.75] mb-20 md:mb-0"
                        style={{ transformOrigin: 'top center' }}
                    >
                        <div
                            id="export-container"
                            ref={reportRef}
                            className="w-[900px] min-h-[1200px] p-12 relative flex flex-col"
                            style={{
                                backgroundColor: colors.bg,
                                color: colors.textMain,
                                backgroundImage: (() => {
                                    if (template === 'ink') return 'url("/rice-paper-2.png")';
                                    if (template === 'mystic')
                                        return `linear-gradient(to bottom, ${colors.bg}, #292524)`;
                                    if (template === 'royal')
                                        return `linear-gradient(135deg, #2d1b1b 0%, #1a0f0f 50%, #2d1b1b 100%)`;
                                    if (template === 'minimal')
                                        return `linear-gradient(to bottom, #fafafa, #f5f5f5)`;
                                    if (template === 'starry')
                                        return `radial-gradient(ellipse at top, #1e1b4b 0%, #0f0a1f 100%)`;
                                    if (template === 'cyber')
                                        return `linear-gradient(to bottom, #0a0a0a, #1a1a1a, #0a0a0a)`;
                                    return colors.bg;
                                })(),
                                backgroundSize: 'cover',
                                fontFamily: '"Times New Roman", Times, serif',
                                gap: '2rem',
                            }}
                        >
                            {/* Border Decoration */}
                            <div
                                className="absolute inset-4 border-2 pointer-events-none z-20"
                                style={{ borderColor: colors.accent, opacity: 0.2 }}
                            ></div>
                            <div
                                className="absolute inset-5 border pointer-events-none z-20"
                                style={{ borderColor: colors.accent, opacity: 0.1 }}
                            ></div>

                            <Watermark />

                            <div
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2rem',
                                }}
                            >
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
