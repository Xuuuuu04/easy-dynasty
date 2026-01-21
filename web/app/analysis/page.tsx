'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import spreadsData from '../../data/spreads.json'
import DrawnCardsDisplay from '../../components/DrawnCardsDisplay'
import AnalysisDisplay from '../../components/AnalysisDisplay'
import { useTarotAnalysis } from '@/hooks/useTarotAnalysis'
import type { DrawnCard, Spread } from '@/types/tarot'

import ExportReportModal from '../../components/ExportReportModal'
import { useToast } from '@/components/Toast'
import { preprocessMarkdown } from '@/utils/markdown'

// 清理 AI 响应中的 markdown 代码块符号
const cleanAiResponse = (text: string) => text.replace(/^```markdown\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '')

// Custom Icons
const CrystalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-600">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
)

const NewReadingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
  </svg>
)

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
  </svg>
)

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
)

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
)

export default function AnalysisPage() {
  const [question, setQuestion] = useState('')
  const [spread, setSpread] = useState<Spread | null>(null)
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([])
  const [user, setUser] = useState<any>(null)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setUser(data);
    } catch (err) {
        console.error(err);
    }
  };

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
    performAnalysis
  } = useTarotAnalysis()

  useEffect(() => {
    fetchUser();
    // 从 sessionStorage 获取数据
    const savedQuestion = sessionStorage.getItem('tarot_question')
    const savedSpreadId = sessionStorage.getItem('tarot_spread')
    const savedDrawnCards = sessionStorage.getItem('tarot_drawn_cards')

    if (!savedQuestion || !savedSpreadId || !savedDrawnCards) {
      router.push('/')
      return
    }

    setQuestion(savedQuestion)

    // 找到对应的牌阵
    const selectedSpread = spreadsData.spreads.find(s => s.id === savedSpreadId)
    if (!selectedSpread) {
      router.push('/')
      return
    }
    setSpread(selectedSpread)

    try {
      const cards = JSON.parse(savedDrawnCards) as DrawnCard[]
      setDrawnCards(cards)

      // 自动开始分析
      performAnalysis(savedQuestion, selectedSpread, cards).then(() => fetchUser())
    } catch (parseError) {
      console.error('解析抽牌数据失败:', parseError)
      router.push('/')
    }
  }, [router, performAnalysis])

  const handleReinterpret = useCallback(async (model: string): Promise<boolean> => {
    if (!spread || drawnCards.length === 0) return false
    const success = await performAnalysis(question, spread, drawnCards, model)
    if (success) fetchUser();
    return success
  }, [question, spread, drawnCards, performAnalysis])

  const handleNewReading = () => {
    // 清除 sessionStorage
    sessionStorage.removeItem('tarot_question')
    sessionStorage.removeItem('tarot_spread')
    sessionStorage.removeItem('tarot_drawn_cards')
    router.push('/')
  }

  const handleExportClick = () => {
      if (user?.tier === 'svip') {
          setIsExportModalOpen(true);
      } else {
          showToast('导出精美报告仅限 SVIP 用户使用，请升级解锁。', 'error');
          // Optional: redirect to VIP page after a delay
          // setTimeout(() => router.push('/vip'), 1500);
      }
  }

  if (!spread || drawnCards.length === 0) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-paper flex items-center justify-center">
        <div className="relative text-center space-y-4 animate-pulse">
          <div className="relative mx-auto h-20 w-20">
            <div className="absolute inset-0 rounded-full border-4 border-stone-200"></div>
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#9a2b2b] border-r-stone-400"></div>
          </div>
          <div className="text-xl font-semibold text-stone-700 font-display">
            正在汇聚塔罗能量...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper text-ink selection:bg-[#9a2b2b]/10">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 space-y-6 animate-slide-up">
            <div className="inline-flex items-center justify-center gap-3">
              <span className="animate-float"><CrystalIcon /></span>
              <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-ink">
                塔罗解读
              </h1>
            </div>

            <div className="ink-card px-8 py-6 max-w-3xl mx-auto">
              <div className="space-y-3">
                <p className="text-stone-800 text-lg font-serif">
                  <span className="text-[#9a2b2b] font-bold uppercase tracking-wider text-xs mr-2">Question</span>
                  {question}
                </p>
                <div className="h-px w-full bg-stone-200" />
                <div className="flex justify-between items-center">
                    <p className="text-stone-500 text-sm">
                      <span className="text-stone-400 font-bold uppercase tracking-wider text-xs mr-2">Spread</span>
                      {spread.name}
                    </p>
                    {user && (
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest bg-stone-100 px-2 py-0.5 rounded-full">
                            今日剩余次数: {user.tarot_limit - user.tarot_used_today} / {user.tarot_limit}
                        </span>
                    )}
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
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={handleNewReading}
              className="btn-seal"
            >
              <NewReadingIcon />
              <span>新的占卜</span>
            </button>

            <button
              onClick={() => router.push('/history')}
              className="px-8 py-3 rounded-sm border border-stone-300 text-stone-600 hover:text-stone-900 hover:border-stone-400 bg-white/50 transition-all font-medium flex items-center gap-2"
            >
              <HistoryIcon />
              <span>占卜历史</span>
            </button>

            <button
                onClick={handleExportClick}
                disabled={!analysis}
                className={`px-8 py-3 rounded-sm border transition-all font-medium flex items-center gap-2
                    ${!analysis ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                    ${user?.tier === 'svip'
                        ? 'border-amber-500 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:border-amber-600 shadow-sm'
                        : 'border-stone-300 text-stone-500 bg-stone-100 hover:bg-stone-200'}
                `}
            >
                {user?.tier === 'svip' ? <ShareIcon /> : <LockIcon />}
                <span>导出报告</span>
                {user?.tier !== 'svip' && <span className="ml-1 text-[10px] px-1.5 py-0.5 bg-stone-200 rounded text-stone-500">SVIP</span>}
            </button>

            <button
              onClick={() => router.push('/settings')}
              className="px-8 py-3 rounded-sm border border-stone-300 text-stone-600 hover:text-stone-900 hover:border-stone-400 bg-white/50 transition-all font-medium flex items-center gap-2"
            >
              <SettingsIcon />
              <span>设置</span>
            </button>
          </div>
        </div>
      </div>

      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        type="tarot"
        data={{
            question,
            spreadName: spread?.name || '',
            drawnCards,
            analysis: cleanAiResponse(analysis)
        }}
        userName={user?.username || 'Guest'}
      />
    </div>
  )
}
