'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { historyManager } from '@/utils/historyManager'
import { useToast } from '@/components/Toast'
import type { ReadingHistory } from '@/types/tarot'
import { HistoryIcon, BaziIcon, TarotIcon } from '@/components/Icons'

export default function HistoryPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [history, setHistory] = useState<ReadingHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (token) {
            const cloudHistory = await historyManager.fetchCloudHistory();
            setHistory(cloudHistory);
        } else {
            setHistory(historyManager.getLocalHistory());
        }
        setLoading(false);
    }
    loadHistory();
  }, [])

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) {
      return '未知时间'
    }

    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('确定要删除这条记录吗？')) return;

    const token = localStorage.getItem('token');
    try {
        if (token) {
            const success = await historyManager.deleteCloudReading(id);
            if (success) {
                setHistory(prev => prev.filter(item => item.id !== id));
                showToast('已删除', 'success');
            } else {
                showToast('删除失败', 'error');
            }
        } else {
            historyManager.deleteReading(id);
            setHistory(prev => prev.filter(item => item.id !== id));
            showToast('已删除', 'success');
        }
    } catch(err) {
        showToast('删除失败', 'error');
    }
  }

  return (
    <div className="relative min-h-screen pt-24 pb-12 px-4 overflow-hidden bg-[#f5f5f0] text-stone-800 font-serif">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none overflow-hidden z-0 opacity-[0.08]">
         <div className="absolute top-20 left-10 text-6xl writing-vertical font-serif">往事不可谏 来者犹可追</div>
         <div className="absolute bottom-20 right-1/4 text-4xl writing-vertical font-serif">阅尽千帆 归来仍是少年</div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-6 animate-slide-up">
          <div className="inline-flex items-center justify-center gap-3">
            <span className="text-4xl text-stone-400"><HistoryIcon /></span>
            <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-ink">
              占卜历史
            </h1>
          </div>
          <p className="mx-auto max-w-2xl text-lg text-stone-500">
            回顾你与命运的每一次对话
          </p>
        </div>

        <div className="mb-10 flex flex-wrap items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 rounded-sm border border-stone-300 hover:bg-stone-200 text-stone-600 transition-all flex items-center gap-2"
          >
            <span>←</span> 返回首页
          </button>
        </div>

        {loading ? (
            <div className="text-center text-stone-400 py-20 animate-pulse tracking-widest">正在读取历史卷宗...</div>
        ) : history.length === 0 ? (
          <div className="ink-card p-12 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-stone-100 flex items-center justify-center text-4xl text-stone-400 animate-float">
                <BaziIcon />
            </div>
            <h2 className="text-2xl font-bold text-ink mb-4">
              暂无历史记录
            </h2>
            <p className="text-stone-500 mb-8 max-w-md mx-auto">
              前往首页开启你的第一次探索。
            </p>
            <button
              onClick={() => router.push('/')}
              className="btn-seal px-8 py-3 shadow-lg flex items-center gap-2"
            >
              <TarotIcon className="w-5 h-5" />
              <span>开始占卜</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {history.map((entry, index) => (
              <div
                key={entry.id}
                onClick={() => router.push(`/history/${entry.id}`)} // Need to implement detail page
                className="group relative cursor-pointer overflow-hidden rounded-sm ink-card p-6 transition-all duration-300 hover:shadow-md hover:border-[#9a2b2b]/30"
                style={{ animationDelay: `${0.05 * (index + 1)}s` }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#9a2b2b] bg-[#9a2b2b]/5 px-2.5 py-1 rounded-full">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                      {entry.spreadName && (
                        <span className="text-xs font-medium text-stone-400 border border-stone-200 px-2 py-0.5 rounded-md">
                            {entry.spreadName}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-ink truncate group-hover:text-[#9a2b2b] transition-colors font-serif">
                      {entry.question}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-stone-400 text-sm sm:text-right">
                    <button 
                        onClick={(e) => handleDelete(e, entry.id)}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all p-2"
                        title="删除"
                    >
                        ✕
                    </button>
                    <span className="text-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
