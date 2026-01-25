'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getCardImage, AVAILABLE_DECKS } from '@/utils/cardImages';
import { useDeck } from '@/context/DeckContext';
import {
    TarotIcon,
    BookOpenIcon,
    HeartIcon,
    BriefcaseIcon,
    CoinsIcon,
    LightbulbIcon,
} from './Icons';

interface TarotCardData {
    id: number | string;
    name: string;
    englishName: string;
    suit: string;
    uprightKeywords: string[];
    reversedKeywords: string[];
    uprightMeaning?: string;
    reversedMeaning?: string;
}

interface CardDetailModalProps {
    card: TarotCardData;
    onClose: () => void;
}

type TabType = 'overview' | 'love' | 'career' | 'finance' | 'advice';

export default function CardDetailModal({ card, onClose }: CardDetailModalProps) {
    const { currentDeck } = useDeck();
    const [isVisible, setIsVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [selectedDeckVariant, setSelectedDeckVariant] = useState(currentDeck);

    useEffect(() => {
        setIsVisible(true);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    // Helper function to generate placeholder content
    const getContentForArea = (area: string, isReversed: boolean) => {
        const position = isReversed ? '逆位' : '正位';
        const meanings: Record<string, string> = {
            love: `在爱情方面，${card.name}${position}代表 {${isReversed ? card.reversedKeywords.slice(0, 2).join('、') : card.uprightKeywords.slice(0, 2).join('、')}} 等能量。这暗示着你在情感关系中需要关注这些方面，并根据当前的情况做出相应的调整。`,
            career: `在事业方面，${card.name}${position}提示 {${isReversed ? card.reversedKeywords.slice(0, 2).join('、') : card.uprightKeywords.slice(0, 2).join('、')}}。这可能意味着你的职业发展正处于一个需要特别注意的阶段。`,
            finance: `在财运方面，${card.name}${position}显示 {${isReversed ? card.reversedKeywords.slice(0, 2).join('、') : card.uprightKeywords.slice(0, 2).join('、')}}。建议你在理财和投资方面保持谨慎，并根据这些提示调整你的财务策略。`,
        };
        return meanings[area] || '暂无详细解析';
    };

    if (!card) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal Content */}
            <div
                className={`relative bg-card-bg w-full md:max-w-5xl h-full md:h-[92vh] md:rounded-xl shadow-2xl overflow-hidden flex flex-col transform transition-all duration-500 md:mx-4 border border-border ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}
            >
                {/* Header */}
                <div className="relative bg-gradient-to-r from-text-main to-text-sub dark:from-slate-900 dark:to-slate-800 text-bg-main dark:text-text-main p-4 md:p-6 flex items-center justify-between shrink-0 z-20 border-b border-border/50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                            <TarotIcon className="w-5 h-5 md:w-6 md:h-6 text-current" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold">{card.name}</h2>
                            <p className="text-xs md:text-sm opacity-70 tracking-wider uppercase">
                                {card.englishName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Left: Card Image */}
                    <div className="w-full md:w-2/5 bg-bg-main p-4 md:p-8 flex flex-col items-center justify-center relative md:overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-border">
                        <div className="relative w-[180px] h-[300px] md:w-full md:max-w-[280px] md:h-[480px] shadow-2xl rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-500 border-4 border-card-bg shrink-0">
                            <Image
                                src={getCardImage(card.id, selectedDeckVariant)}
                                alt={card.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 200px, 300px"
                                priority
                            />
                            {/* Fallback Indicator */}
                            {selectedDeckVariant !== 'rws' &&
                                getCardImage(card.id, selectedDeckVariant).includes(
                                    '/decks/rws/'
                                ) && (
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded border border-white/20 select-none">
                                        此版本暂缺
                                    </div>
                                )}
                        </div>

                        {/* Variant Switcher */}
                        <div className="mt-4 md:mt-6 flex flex-wrap gap-2 justify-center z-10">
                            {AVAILABLE_DECKS.map((deck) => (
                                <button
                                    key={deck.id}
                                    onClick={() => setSelectedDeckVariant(deck.id)}
                                    className={`px-3 py-1.5 text-xs rounded-full border transition-all font-serif tracking-wide ${selectedDeckVariant === deck.id
                                        ? 'bg-text-main text-bg-main border-text-main'
                                        : 'text-text-muted border-border hover:border-text-muted hover:text-text-sub bg-card-bg/50'
                                        }`}
                                >
                                    {deck.name}
                                </button>
                            ))}
                        </div>

                        {/* Background watermark */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                            <TarotIcon className="w-full h-full text-text-main" />
                        </div>
                    </div>

                    {/* Right: Tabbed Content */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-card-bg/50">
                        {/* Tab Navigation */}
                        <div className="flex border-b border-border bg-bg-main/50 px-6 overflow-x-auto no-scrollbar">
                            {[
                                { id: 'overview', label: '综合解析', Icon: BookOpenIcon },
                                { id: 'love', label: '爱情', Icon: HeartIcon },
                                { id: 'career', label: '事业', Icon: BriefcaseIcon },
                                { id: 'finance', label: '财运', Icon: CoinsIcon },
                                { id: 'advice', label: '建议', Icon: LightbulbIcon },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TabType)}
                                    className={`px-4 py-3 text-sm font-medium transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${activeTab === tab.id
                                        ? 'text-accent-main border-accent-main'
                                        : 'text-text-muted border-transparent hover:text-text-sub'
                                        }`}
                                >
                                    <tab.Icon className="w-4 h-4 shrink-0" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                            {activeTab === 'overview' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {card.suit === 'major' ? (
                                            <span className="text-xs font-bold text-bg-main bg-text-main px-3 py-1 rounded-full">
                                                大阿卡纳 Major Arcana
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-text-sub bg-bg-main px-3 py-1 rounded-full capitalize">
                                                {card.suit} 小阿卡纳
                                            </span>
                                        )}
                                    </div>

                                    {/* Upright */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-1.5 h-6 bg-emerald-600 rounded-full"></span>
                                            <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-400">
                                                正位 Upright
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {card.uprightKeywords.map((k, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800"
                                                >
                                                    {k}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-text-sub leading-relaxed text-base font-serif">
                                            {card.uprightMeaning ||
                                                '此牌正位代表积极、正向的能量。建议你保持乐观的态度，勇敢前行。'}
                                        </p>
                                    </div>

                                    {/* Reversed */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-1.5 h-6 bg-amber-600 rounded-full"></span>
                                            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-400">
                                                逆位 Reversed
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {card.reversedKeywords.map((k, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800"
                                                >
                                                    {k}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-text-sub leading-relaxed text-base font-serif">
                                            {card.reversedMeaning ||
                                                '此牌逆位提示你需要注意潜在的挑战或阻碍，调整你的策略和心态。'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'love' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                            <HeartIcon className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-rose-800 dark:text-rose-300">
                                            爱情 · 情感关系
                                        </h3>
                                        <p className="text-sm text-text-muted mt-2">
                                            Love & Relationships
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-rose-50 dark:bg-rose-900/10 rounded-lg p-6 border border-rose-200 dark:border-rose-800">
                                            <h4 className="font-bold text-rose-800 dark:text-rose-300 mb-3 flex items-center gap-2">
                                                <span className="text-green-600 dark:text-green-400">↑</span> 正位时
                                            </h4>
                                            <p className="text-text-sub leading-relaxed">
                                                {getContentForArea('love', false)}
                                            </p>
                                        </div>

                                        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
                                            <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                                                <span className="text-orange-600 dark:text-orange-400">↓</span> 逆位时
                                            </h4>
                                            <p className="text-text-sub leading-relaxed">
                                                {getContentForArea('love', true)}
                                            </p>
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                                            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                                                <LightbulbIcon className="w-4 h-4" />
                                                关系建议
                                            </h4>
                                            <ul className="space-y-2 text-text-sub">
                                                <li className="flex gap-2">
                                                    <span>•</span>
                                                    <span>倾听内心的声音，理解自己的真实需求</span>
                                                </li>
                                                <li className="flex gap-2">
                                                    <span>•</span>
                                                    <span>保持开放与诚实的沟通</span>
                                                </li>
                                                <li className="flex gap-2">
                                                    <span>•</span>
                                                    <span>结合牌面含义，反思当前关系的状态</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'career' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <BriefcaseIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                                            事业 · 职业发展
                                        </h3>
                                        <p className="text-sm text-text-muted mt-2">
                                            Career & Professional Life
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-lg p-6 border border-emerald-200 dark:border-emerald-800">
                                            <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
                                                <span className="text-green-600 dark:text-green-400">↑</span> 正位时
                                            </h4>
                                            <p className="text-text-sub leading-relaxed">
                                                {getContentForArea('career', false)}
                                            </p>
                                        </div>

                                        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
                                            <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                                                <span className="text-orange-600 dark:text-orange-400">↓</span> 逆位时
                                            </h4>
                                            <p className="text-text-sub leading-relaxed">
                                                {getContentForArea('career', true)}
                                            </p>
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                                            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                                                <LightbulbIcon className="w-4 h-4" />
                                                职业建议
                                            </h4>
                                            <ul className="space-y-2 text-text-sub">
                                                <li className="flex gap-2">
                                                    <span>•</span>
                                                    <span>
                                                        评估当前的职业方向是否符合你的价值观
                                                    </span>
                                                </li>
                                                <li className="flex gap-2">
                                                    <span>•</span>
                                                    <span>考虑新的技能学习或职业发展机会</span>
                                                </li>
                                                <li className="flex gap-2">
                                                    <span>•</span>
                                                    <span>保持灵活性,准备迎接变化</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'finance' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <CoinsIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-green-800 dark:text-green-300">
                                            财运 · 物质生活
                                        </h3>
                                        <p className="text-sm text-text-muted mt-2">
                                            Finance & Material Wealth
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-6 border border-green-200 dark:border-green-800">
                                            <h4 className="font-bold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                                                <span className="text-green-600 dark:text-green-400">↑</span> 正位时
                                            </h4>
                                            <p className="text-text-sub leading-relaxed">
                                                {getContentForArea('finance', false)}
                                            </p>
                                        </div>

                                        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
                                            <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                                                <span className="text-orange-600 dark:text-orange-400">↓</span> 逆位时
                                            </h4>
                                            <p className="text-text-sub leading-relaxed">
                                                {getContentForArea('finance', true)}
                                            </p>
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                                            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                                                <LightbulbIcon className="w-4 h-4" />
                                                理财建议
                                            </h4>
                                            <ul className="space-y-2 text-text-sub">
                                                <li className="flex gap-2">
                                                    <span>•</span>
                                                    <span>制定合理的财务规划和预算</span>
                                                </li>
                                                <li className="flex gap-2">
                                                    <span>•</span>
                                                    <span>避免冲动消费,理性看待投资机会</span>
                                                </li>
                                                <li className="flex gap-2">
                                                    <span>•</span>
                                                    <span>平衡物质追求与精神满足</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'advice' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                            <LightbulbIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-indigo-800 dark:text-indigo-300">
                                            实践建议 · 学习指引
                                        </h3>
                                        <p className="text-sm text-text-muted mt-2">
                                            Practical Advice & Learning Guide
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
                                            <h4 className="font-bold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2">
                                                <svg
                                                    className="w-5 h-5"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <circle cx="12" cy="12" r="6"></circle>
                                                    <circle cx="12" cy="12" r="2"></circle>
                                                </svg>
                                                如何应用此牌
                                            </h4>
                                            <ul className="space-y-3 text-text-sub">
                                                <li className="flex gap-3">
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                                        1.
                                                    </span>
                                                    <span>
                                                        <strong>冥想牌面：</strong>
                                                        花几分钟静静观察这张牌的图像,注意你的第一直觉和感受。
                                                    </span>
                                                </li>
                                                <li className="flex gap-3">
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                                        2.
                                                    </span>
                                                    <span>
                                                        <strong>记录联想：</strong>
                                                        在笔记本上记下牌面让你想到的具体情况或人物。
                                                    </span>
                                                </li>
                                                <li className="flex gap-3">
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                                        3.
                                                    </span>
                                                    <span>
                                                        <strong>结合现实：</strong>
                                                        思考当前生活中哪些方面与此牌的能量相呼应。
                                                    </span>
                                                </li>
                                                <li className="flex gap-3">
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                                        4.
                                                    </span>
                                                    <span>
                                                        <strong>采取行动：</strong>
                                                        根据牌意,设定一个小目标并在一周内实践。
                                                    </span>
                                                </li>
                                                <li className="flex gap-3">
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                                        5.
                                                    </span>
                                                    <span>
                                                        <strong>定期回顾：</strong>
                                                        一周后回顾这个目标,看看是否有新的领悟。
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                                            <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                                                <BookOpenIcon className="w-4 h-4" />
                                                学习要点
                                            </h4>
                                            <div className="space-y-3 text-text-sub">
                                                <p>
                                                    <strong>关键词记忆：</strong>
                                                    通过反复查看正逆位关键词,建立对此牌的直觉认知。
                                                </p>
                                                <p>
                                                    <strong>故事联想：</strong>
                                                    为这张牌创造一个个人故事,帮助你更好地记住其含义。
                                                </p>
                                                <p>
                                                    <strong>实例积累：</strong>
                                                    当你在生活中遇到相关情况时,回想这张牌,加深理解。
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-6 border border-yellow-300 dark:border-yellow-700">
                                            <h4 className="font-bold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center gap-2">
                                                <svg
                                                    className="w-5 h-5"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                                </svg>
                                                解读注意事项
                                            </h4>
                                            <ul className="space-y-2 text-stone-700 dark:text-slate-300 text-sm">
                                                <li className="flex gap-2">
                                                    <span>•</span>
                                                    <span>
                                                        塔罗牌是自我探索的工具,不是绝对的预言
                                                    </span>
                                                </li>
                                                <li className="flex gap-2">
                                                    <span>•</span>
                                                    <span>同一张牌在不同情境下可能有不同解读</span>
                                                </li>
                                                <li className="flex gap-2">
                                                    <span>•</span>
                                                    <span>结合其他牌和牌阵位置综合分析</span>
                                                </li>
                                                <li className="flex gap-2">
                                                    <span>•</span>
                                                    <span>相信你的直觉，它是最好的导师</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}