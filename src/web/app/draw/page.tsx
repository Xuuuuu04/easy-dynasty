'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import FanDeck from '@/components/FanDeck';
import SpreadLayout from '@/components/SpreadLayout';
import TarotChat from '@/components/TarotChat';
import ExportReportModal from '@/components/ExportReportModal';
import SpreadSelect from '@/components/SpreadSelect';
import AtmosphereBackground from '@/components/AtmosphereBackground';
import { useToast } from '@/components/Toast';
import spreadsData from '../../data/spreads.json';
import tarotCardsData from '../../data/tarot-cards.json';
import type { TarotCard, Spread, DrawnCard, ChatMessage, ApiConfig } from '@/types/tarot';
import { analyzeTarotReading } from '@/hooks/useTarotAnalysis';
import { constructTarotPrompts } from '@/utils/prompts';
import { preprocessMarkdown } from '@/utils/markdown';
import { TarotIcon, ChartIcon, LogoIcon } from '@/components/Icons';
import CardShowcase from '@/components/CardShowcase';
import { useSound } from '@/context/SoundContext';

// Clean AI response markdown code blocks

export default function DrawPage() {
    const { showToast } = useToast();
    const { play, playBGM } = useSound();

    const [question, setQuestion] = useState('');
    const [spread, setSpread] = useState<Spread | null>(null);
    const [deck, setDeck] = useState<TarotCard[]>([]);
    const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
    const [drawnIndices, setDrawnIndices] = useState<number[]>([]);
    const [showcasingCard, setShowcasingCard] = useState<TarotCard | null>(null);
    const [isDrawingComplete, setIsDrawingComplete] = useState(false);
    const [isAnalysing, setIsAnalysing] = useState(false);
    const [analysis, setAnalysis] = useState('');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const analysisContainerRef = useRef<HTMLDivElement>(null);

    // Chat State
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

    // Updated Model Default
    const [apiConfig, setApiConfig] = useState<ApiConfig>({
        baseUrl: null,
        apiKey: null,
        model: 'Qwen/Qwen3-Next-80B-A3B-Instruct',
    });

    // Setup mode check
    const [setupMode, setSetupMode] = useState(true);

    useEffect(() => {
        // Only fetch config on client mount
        const localModel =
            localStorage.getItem('tarot_api_model')?.trim() || 'Qwen/Qwen3-Next-80B-A3B-Instruct';
        setApiConfig({
            baseUrl: localStorage.getItem('tarot_api_base_url')?.trim() || null,
            apiKey: localStorage.getItem('tarot_api_key')?.trim() || null,
            model: localModel,
        });

        const allCards = [
            ...tarotCardsData.majorArcana,
            ...tarotCardsData.minorArcana.wands,
            ...tarotCardsData.minorArcana.cups,
            ...tarotCardsData.minorArcana.swords,
            ...tarotCardsData.minorArcana.pentacles,
        ];
        const shuffled = [...allCards].sort(() => Math.random() - 0.5);
        setDeck(shuffled);
    }, []);

    useEffect(() => {
        if (analysis && analysisContainerRef.current) {
            analysisContainerRef.current.scrollTop = analysisContainerRef.current.scrollHeight;
        }
    }, [analysis]);

    const handleStartDraw = (q: string, sId: string) => {
        setQuestion(q);
        const foundSpread = spreadsData.spreads.find((s) => s.id === sId);
        if (foundSpread) {
            setSpread(foundSpread);
            setSetupMode(false);
            playBGM();
            play('shuffle');
        }
    };

    const handleCardDraw = (cardIndex: number) => {
        if (!spread || drawnCards.length >= spread.cardCount) return;
        if (drawnIndices.includes(cardIndex)) return;
        if (showcasingCard) return;

        const selectedCard = deck[cardIndex];

        // 1. Remove from Deck immediately
        setDrawnIndices((prev) => [...prev, cardIndex]);

        // 2. Start Showcase Animation
        setShowcasingCard(selectedCard);
    };

    const handleShowcaseComplete = () => {
        if (!showcasingCard || !spread) return;

        const selectedCard = showcasingCard;
        const isReversed = Math.random() > 0.8;
        const positionInfo = spread.positions[drawnCards.length];

        const newDrawnCard: DrawnCard = {
            card: selectedCard,
            isReversed,
            position: positionInfo,
        };

        const newDrawnCards = [...drawnCards, newDrawnCard];
        setDrawnCards(newDrawnCards);
        setShowcasingCard(null);

        if (newDrawnCards.length === spread.cardCount) {
            setTimeout(() => {
                setIsDrawingComplete(true);
                startAnalysis(newDrawnCards);
            }, 1000);
        }
    };

    const startAnalysis = async (cards: DrawnCard[]) => {
        setIsAnalysing(true);
        setAnalysis('');
        play('reveal');
        try {
            const { systemPrompt, userPrompt } = constructTarotPrompts(
                question,
                spread!.name,
                spread!.id,
                cards
            );

            const fullResult = await analyzeTarotReading(
                question,
                spread!,
                cards,
                (currentText) => {
                    setAnalysis(currentText);
                }
            );

            if (fullResult) {
                setAnalysis(fullResult);
                setChatHistory([
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                    { role: 'assistant', content: fullResult },
                ]);
            }
        } catch (err) {
            console.error(err);
            showToast('解读服务繁忙', 'error');
            setAnalysis('抱歉，天机混沌，暂无法获取详细解读。');
        } finally {
            setIsAnalysing(false);
        }
    };

    const handleExportClick = () => {
        setIsExportModalOpen(true);
    };

    const handleRestart = () => {
        setQuestion('');
        setSpread(null);
        setDrawnCards([]);
        setDrawnIndices([]);
        setIsDrawingComplete(false);
        setAnalysis('');
        setSetupMode(true);

        // Reshuffle
        const allCards = [
            ...tarotCardsData.majorArcana,
            ...tarotCardsData.minorArcana.wands,
            ...tarotCardsData.minorArcana.cups,
            ...tarotCardsData.minorArcana.swords,
            ...tarotCardsData.minorArcana.pentacles,
        ];
        const shuffled = [...allCards].sort(() => Math.random() - 0.5);
        setDeck(shuffled);
    };

    // Memoize preprocessed markdown to avoid recalculating on every render
    const processedAnalysis = useMemo(() => {
        return analysis ? preprocessMarkdown(analysis) : '';
    }, [analysis]);

    // Setup/Input View
    if (setupMode) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center bg-bg-main p-4 relative overflow-hidden">
                {/* Atmosphere Background */}
                <AtmosphereBackground />

                {/* Background Texture */}
                <div
                    className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 dark:opacity-5"
                    style={{ backgroundImage: 'url("/rice-paper-2.png")' }}
                ></div>

                {/* Tarot Art Overlay */}
                <div
                    className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.08] mix-blend-multiply dark:mix-blend-overlay"
                    style={{
                        backgroundImage: 'url("/tarot-art-overlay.png")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                ></div>

                {/* Floating Text Decor */}
                <div className="absolute top-[10%] left-[5%] pointer-events-none select-none opacity-[0.06] writing-vertical font-serif text-5xl text-accent-main animate-float">
                    万物皆有灵 · 心诚则灵
                </div>
                <div className="absolute bottom-[15%] right-[10%] pointer-events-none select-none opacity-[0.06] font-serif text-6xl text-text-main animate-float-delayed">
                    Destiny
                </div>

                {/* Card */}
                <div className="relative z-10 w-full max-w-lg bg-card-bg/85 backdrop-blur-xl p-10 md:p-12 rounded-sm shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-border/60 flex flex-col gap-10">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="flex flex-col items-center justify-center mb-6 gap-3">
                            <div className="relative w-16 h-16 text-[var(--accent-main)] transition-transform duration-500 hover:rotate-12">
                                <LogoIcon className="w-full h-full drop-shadow-md" />
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-3xl font-bold font-serif text-[var(--text-main)] tracking-[0.2em] leading-none">
                                    易朝
                                </span>
                                <span className="text-xs text-[var(--accent-main)] uppercase tracking-[0.3em] font-medium leading-none mt-2">
                                    Dynasty
                                </span>
                            </div>
                        </div>
                        <div className="h-px w-16 mx-auto bg-[var(--accent-main)]/30 mb-4"></div>
                        <h1 className="text-xl md:text-2xl font-serif font-bold text-text-main tracking-[0.2em] mb-2 opacity-90">
                            心诚则灵
                        </h1>
                        <p className="text-xs font-serif text-text-muted tracking-widest uppercase opacity-70">
                            Tarot Interpretation
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* Question Input */}
                        <div className="group relative">
                            <label className="block text-xs font-bold text-accent-main uppercase tracking-[0.3em] mb-3 opacity-70 group-focus-within:opacity-100 transition-opacity">
                                你的疑问 / Question
                            </label>
                            <input
                                type="text"
                                className="w-full bg-transparent border-b-[1.5px] border-border py-3 text-lg md:text-xl font-serif text-text-main focus:outline-none focus:border-accent-main placeholder:text-text-muted transition-all duration-300"
                                placeholder="请在此输入心中所惑..."
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                            />
                            <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-accent-main transition-all duration-500 group-focus-within:w-full"></div>
                        </div>

                        {/* Spread Select */}
                        <div className="group relative">
                            <label className="block text-xs font-bold text-accent-main uppercase tracking-[0.3em] mb-3 opacity-70 group-focus-within:opacity-100 transition-opacity">
                                选择牌阵 / Spread
                            </label>
                            <SpreadSelect
                                spreads={spreadsData.spreads}
                                value={spread}
                                onChange={(s) => setSpread(s)}
                                placeholder="请选择适宜的牌阵"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                onClick={() => {
                                    if (!question.trim()) {
                                        showToast('请输入问题', 'warning');
                                        return;
                                    }
                                    if (!spread) {
                                        showToast('请选择牌阵', 'warning');
                                        return;
                                    }
                                    handleStartDraw(question, spread.id);
                                }}
                                className="btn-seal w-full py-4 text-lg shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[1px] transition-all duration-300"
                            >
                                <span>开启卦象</span>
                                <span className="opacity-80 text-sm font-normal">
                                    Start Divination
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Footer Decor */}
                    <div className="text-center">
                        <div className="inline-block w-full h-[1px] bg-gradient-to-r from-transparent via-accent-main/20 to-transparent mb-4"></div>
                        <p className="text-[10px] text-text-muted font-serif tracking-widest">
                            命运掌握在自己手中 · 易朝 AI 辅助解读
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!spread) return null;

    return (
        <div className="min-h-screen pt-20 md:pt-28 pb-12 px-4 relative overflow-hidden bg-bg-main">
            {/* Atmosphere Background */}
            <AtmosphereBackground />

            {/* Background Texture */}
            <div
                className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 dark:opacity-5"
                style={{ backgroundImage: 'url("/rice-paper-2.png")' }}
            ></div>

            {/* Tarot Art Overlay */}
            <div
                className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.08] mix-blend-multiply dark:mix-blend-overlay transition-opacity duration-1000"
                style={{
                    backgroundImage: 'url("/tarot-art-overlay.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            ></div>

            {/* Floating Text Decor */}
            <div className="absolute top-[15%] left-[5%] pointer-events-none select-none opacity-[0.06] writing-vertical font-serif text-4xl text-accent-main animate-float">
                命运之轮 · 愚者 · 倒吊人
            </div>
            <div className="absolute bottom-[20%] right-[8%] pointer-events-none select-none opacity-[0.06] font-serif text-6xl text-text-main animate-float-delayed">
                Arcana
            </div>

            <div className="relative z-10 max-w-6xl mx-auto flex flex-col gap-8 md:gap-12">
                {/* Header Question */}
                <div className="text-center space-y-3 md:space-y-4 animate-fade-in">
                    <div className="inline-block border-b border-accent-main/30 pb-2 px-4 md:px-8">
                        <h2 className="text-lg md:text-2xl font-serif font-bold text-text-main tracking-widest">
                            {question}
                        </h2>
                    </div>
                    <p className="text-text-muted text-xs md:text-sm font-serif uppercase tracking-widest">
                        {spread.name} ·{' '}
                        {isDrawingComplete
                            ? '启示呈现'
                            : `请抽取 ${spread.cardCount - drawnCards.length} 张`}
                    </p>
                </div>

                {/* Interaction Area */}
                <div className="relative min-h-[50vh] flex flex-col items-center justify-start gap-8 md:gap-12">
                    {!isDrawingComplete && (
                        <div className="w-full flex justify-center animate-fade-in overflow-visible z-30">
                            <FanDeck
                                totalCards={deck.length}
                                selectedCards={drawnIndices}
                                onCardSelect={handleCardDraw}
                                disabled={drawnCards.length >= spread.cardCount}
                            />
                        </div>
                    )}

                    <div className={`transition-all duration-1000 transform origin-top ${isDrawingComplete ? 'scale-90 md:scale-100' : 'scale-75 md:scale-90 opacity-80'}`}>
                        <SpreadLayout
                            spreadId={spread.id}
                            positions={spread.positions}
                            drawnCards={drawnCards}
                            onPositionClick={() => { }}
                            canDrawAtPosition={() => false}
                            isDrawing={false}
                            drawingPositionId={null}
                        />
                    </div>

                    {isDrawingComplete && (
                        <div className="w-full max-w-4xl animate-slide-up space-y-8 px-2">
                            <div className="ink-card p-6 md:p-12 bg-card-bg/85 backdrop-blur-xl relative min-h-[300px] border-border/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
                                <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-border pb-4">
                                    <div className="flex items-center gap-3">
                                        <ChartIcon className="w-5 h-5 text-accent-main" />
                                        <h3 className="text-lg md:text-xl font-serif font-bold text-text-main tracking-widest">
                                            易朝 · 启示录
                                        </h3>
                                    </div>
                                    {analysis && (
                                        <button
                                            onClick={handleExportClick}
                                            className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all bg-bg-main border-border text-text-sub hover:bg-bg-main/80"
                                        >
                                            {/* Fixed SVG - using Standard Feather Download Icon */}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="7 10 12 15 17 10" />
                                                <line x1="12" y1="15" x2="12" y2="3" />
                                            </svg>
                                            <span>导出</span>
                                        </button>
                                    )}
                                </div>

                                <div
                                    ref={analysisContainerRef}
                                    className="prose dark:prose-invert prose-stone max-w-none font-serif text-base md:text-lg leading-loose text-text-main max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar"
                                >
                                    {!analysis && isAnalysing ? (
                                        <div className="flex items-center justify-center h-32 gap-3 text-text-muted tracking-[0.2em]">
                                            <div className="w-1.5 h-1.5 bg-accent-main rounded-full animate-ping"></div>
                                            <span>推演中...</span>
                                        </div>
                                    ) : (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]} // Enable GFM for tables
                                            components={{
                                                h1: ({ children }) => (
                                                    <h1 className="mb-6 text-xl md:text-2xl font-bold text-text-main border-b-2 border-accent-main pb-1 inline-block">
                                                        {children}
                                                    </h1>
                                                ),
                                                h2: ({ children }) => (
                                                    <h2 className="mb-4 mt-8 text-lg md:text-xl font-bold text-text-main border-b border-border pb-1">
                                                        {children}
                                                    </h2>
                                                ),
                                                h3: ({ children }) => (
                                                    <h3 className="mb-2 mt-6 text-base md:text-lg font-bold text-accent-main">
                                                        {children}
                                                    </h3>
                                                ),
                                                p: ({ children }) => (
                                                    <p className="mb-4 leading-relaxed text-text-sub text-sm md:text-base">
                                                        {children}
                                                    </p>
                                                ),
                                                strong: ({ children }) => (
                                                    <strong className="font-bold text-accent-main dark:text-accent-light">
                                                        {children}
                                                    </strong>
                                                ),
                                                em: ({ children }) => (
                                                    <em className="italic text-text-main">
                                                        {children}
                                                    </em>
                                                ),
                                                blockquote: ({ children }) => (
                                                    <blockquote className="my-6 border-l-4 border-accent-main bg-stone-100 dark:bg-[var(--accent-main)]/10 py-4 pl-5 pr-4 italic text-stone-700 dark:text-white rounded-r-sm shadow-sm">
                                                        {children}
                                                    </blockquote>
                                                ),
                                                // Add table styling
                                                table: ({ children }) => (
                                                    <div className="overflow-x-auto my-6">
                                                        <table className="min-w-full text-left text-sm whitespace-nowrap">
                                                            {children}
                                                        </table>
                                                    </div>
                                                ),
                                                th: ({ children }) => (
                                                    <th className="font-bold border-b border-border p-2 text-accent-main">
                                                        {children}
                                                    </th>
                                                ),
                                                td: ({ children }) => (
                                                    <td className="border-b border-border p-2 text-text-sub">
                                                        {children}
                                                    </td>
                                                ),
                                            }}
                                        >
                                            {processedAnalysis}
                                        </ReactMarkdown>
                                    )}
                                </div>

                                {!isAnalysing && analysis && (
                                    <TarotChat initialHistory={chatHistory} apiConfig={apiConfig} />
                                )}
                            </div>

                            <div className="flex justify-center pt-4 pb-12">
                                <button
                                    onClick={handleRestart}
                                    className="btn-seal text-base md:text-lg px-10 py-3 flex items-center gap-2"
                                >
                                    <TarotIcon className="w-4 h-4" />
                                    <span>重起一卦</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ExportReportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                type="tarot"
                data={{
                    question,
                    spreadName: spread?.name || '',
                    spreadId: spread?.id,
                    positions: spread?.positions,
                    drawnCards,
                    analysis: preprocessMarkdown(analysis),
                }}
                userName={'Seeker'}
            />

            {showcasingCard && (
                <CardShowcase card={showcasingCard} onComplete={handleShowcaseComplete} />
            )}
        </div>
    );
}
