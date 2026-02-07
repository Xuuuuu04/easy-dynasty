'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import spreadsData from '../../data/spreads.json';
import DrawnCardsDisplay from '../../components/DrawnCardsDisplay';
import AnalysisDisplay from '../../components/AnalysisDisplay';
import { useTarotAnalysis } from '@/hooks/useTarotAnalysis';
import type { DrawnCard, Spread } from '@/types/tarot';

import ExportReportModal from '../../components/ExportReportModal';

// Clean AI response markdown code blocks
const cleanAiResponse = (text: string) =>
    text
        .replace(/^```markdown\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```\s*$/, '');

// Custom Icons
const CrystalIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-stone-600"
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
    </svg>
);

const NewReadingIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
    </svg>
);

const ShareIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
);

export default function AnalysisPage() {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [sessionPayload] = useState<{
        question: string;
        spread: Spread;
        drawnCards: DrawnCard[];
    } | null>(() => {
        if (typeof window === 'undefined') return null;
        const savedQuestion = sessionStorage.getItem('tarot_question');
        const savedSpreadId = sessionStorage.getItem('tarot_spread');
        const savedDrawnCards = sessionStorage.getItem('tarot_drawn_cards');
        if (!savedQuestion || !savedSpreadId || !savedDrawnCards) return null;

        const selectedSpread = spreadsData.spreads.find((s) => s.id === savedSpreadId);
        if (!selectedSpread) return null;

        try {
            return {
                question: savedQuestion,
                spread: selectedSpread as Spread,
                drawnCards: JSON.parse(savedDrawnCards) as DrawnCard[],
            };
        } catch (error) {
            console.error('Parse Error:', error);
            return null;
        }
    });
    const router = useRouter();

    const {
        analysis,
        isLoading,
        error,
        chatHistory,
        hasCustomApiConfig,
        customApiBaseUrl,
        customApiKey,
        selectedModel,
        analysisContainerRef,
        setSelectedModel,
        performAnalysis,
    } = useTarotAnalysis();

    const question = sessionPayload?.question;
    const spread = sessionPayload?.spread;
    const drawnCards = sessionPayload?.drawnCards;

    useEffect(() => {
        if (!sessionPayload) {
            router.push('/');
            return;
        }
        void performAnalysis(sessionPayload.question, sessionPayload.spread, sessionPayload.drawnCards);
    }, [router, performAnalysis, sessionPayload]);

    const handleReinterpret = useCallback(
        async (model: string): Promise<boolean> => {
            if (!question || !spread || !drawnCards || drawnCards.length === 0) return false;
            const success = await performAnalysis(question, spread, drawnCards, model);
            return success;
        },
        [question, spread, drawnCards, performAnalysis]
    );

    const handleNewReading = () => {
        sessionStorage.removeItem('tarot_question');
        sessionStorage.removeItem('tarot_spread');
        sessionStorage.removeItem('tarot_drawn_cards');
        router.push('/');
    };

    const handleExportClick = () => {
        setIsExportModalOpen(true);
    };

    if (!question || !spread || !drawnCards || drawnCards.length === 0) {
        return (
            <div className="relative min-h-screen overflow-hidden bg-bg-main flex items-center justify-center">
                <div className="relative text-center space-y-4 animate-pulse">
                    <div className="relative mx-auto h-20 w-20">
                        <div className="absolute inset-0 rounded-full border-4 border-border"></div>
                        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-accent-main border-r-text-muted"></div>
                    </div>
                    <div className="text-xl font-semibold text-text-main font-display">
                        正在汇聚塔罗能量...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-bg-main text-text-main selection:bg-accent-main/10">
            <div className="relative z-10 container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10 space-y-6 animate-slide-up">
                        <div className="inline-flex items-center justify-center gap-3">
                            <span className="animate-float">
                                <CrystalIcon />
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-text-main">
                                塔罗解读
                            </h1>
                        </div>

                        <div className="ink-card px-8 py-6 max-w-3xl mx-auto bg-card-bg border border-border">
                            <div className="space-y-3">
                                <p className="text-text-main text-lg font-serif">
                                    <span className="text-accent-main font-bold uppercase tracking-wider text-xs mr-2">
                                        Question
                                    </span>
                                    {question}
                                </p>
                                <div className="h-px w-full bg-border" />
                                <div className="flex justify-between items-center">
                                    <p className="text-text-sub text-sm">
                                        <span className="text-text-muted font-bold uppercase tracking-wider text-xs mr-2">
                                            Spread
                                        </span>
                                        {spread.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Cards Display */}
                        <DrawnCardsDisplay drawnCards={drawnCards} />

                        {/* Analysis Display */}
                        <AnalysisDisplay
                            analysis={analysis}
                            isLoading={isLoading}
                            error={error}
                            chatHistory={chatHistory}
                            hasCustomApiConfig={hasCustomApiConfig}
                            customApiBaseUrl={customApiBaseUrl}
                            customApiKey={customApiKey}
                            selectedModel={selectedModel}
                            analysisContainerRef={analysisContainerRef}
                            onModelChange={setSelectedModel}
                            onReinterpret={handleReinterpret}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div
                        className="mt-12 flex flex-wrap items-center justify-center gap-6 animate-slide-up"
                        style={{ animationDelay: '0.3s' }}
                    >
                        <button onClick={handleNewReading} className="btn-seal">
                            <NewReadingIcon />
                            <span>新的占卜</span>
                        </button>

                        <button
                            onClick={handleExportClick}
                            disabled={!analysis}
                            className={`px-8 py-3 rounded-sm border transition-all font-medium flex items-center gap-2
                    ${!analysis ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                    border-border text-text-sub bg-bg-main hover:bg-bg-main/80
                `}
                        >
                            <ShareIcon />
                            <span>导出报告</span>
                        </button>
                    </div>
                </div>
            </div>

            <ExportReportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                type="tarot"
                data={{
                    question: question || '',
                    spreadName: spread?.name || '',
                    drawnCards: drawnCards || [],
                    analysis: cleanAiResponse(analysis),
                }}
                userName={'Seeker'}
            />
        </div>
    );
}
