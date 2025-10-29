'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown, { type Components } from 'react-markdown'
import { historyManager, type ReadingHistory } from '@/utils/historyManager'

const cx = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(' ')

const markdownComponents: Components = {
  h1: ({ children, className, ...props }) => (
    <h1
      {...props}
      className={cx(
        'mb-4 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-100 to-pink-100',
        className
      )}
    >
      {children}
    </h1>
  ),
  h2: ({ children, className, ...props }) => (
    <h2 {...props} className={cx('mb-3 mt-6 text-xl font-bold text-white', className)}>
      {children}
    </h2>
  ),
  h3: ({ children, className, ...props }) => (
    <h3 {...props} className={cx('mb-2 mt-4 text-lg font-semibold text-purple-100', className)}>
      {children}
    </h3>
  ),
  p: ({ children, className, ...props }) => (
    <p {...props} className={cx('mb-4 leading-relaxed text-slate-200', className)}>
      {children}
    </p>
  ),
  strong: ({ children, className, ...props }) => (
    <strong {...props} className={cx('font-semibold text-white', className)}>
      {children}
    </strong>
  ),
  em: ({ children, className, ...props }) => (
    <em {...props} className={cx('text-purple-300', className)}>
      {children}
    </em>
  ),
  ul: ({ children, className, ...props }) => (
    <ul {...props} className={cx('mb-4 space-y-1 pl-6 text-slate-200', className)}>
      {children}
    </ul>
  ),
  ol: ({ children, className, ...props }) => (
    <ol {...props} className={cx('mb-4 space-y-1 pl-6 text-slate-200', className)}>
      {children}
    </ol>
  ),
  li: ({ children, className, ...props }) => (
    <li {...props} className={cx('text-slate-200', className)}>
      {children}
    </li>
  ),
  blockquote: ({ children, className, ...props }) => (
    <blockquote
      {...props}
      className={cx(
        'my-4 border-l-4 border-purple-400/60 bg-purple-500/10 py-2 pl-4 italic text-purple-200 rounded-r-lg',
        className
      )}
    >
      {children}
    </blockquote>
  ),
}

export default function HistoryPage() {
  const router = useRouter()
  const [history, setHistory] = useState<ReadingHistory[]>(() => {
    if (typeof window !== 'undefined') {
      return historyManager.getAllHistory()
    }
    return []
  })

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
      second: '2-digit',
      hour12: false,
    }).format(date)
  }

  const refreshHistory = () => {
    setHistory(historyManager.getAllHistory())
  }

  const handleDelete = (id: string) => {
    const confirmResult = window.confirm('确定要删除这条占卜记录吗？')
    if (!confirmResult) return

    try {
      historyManager.deleteReading(id)
      refreshHistory()
    } catch (error) {
      console.error('删除历史记录失败:', error)
      alert('删除失败，请稍后重试。')
    }
  }

  const handleClear = () => {
    if (!history.length) return

    const confirmResult = window.confirm('确定要清空所有占卜历史吗？')
    if (!confirmResult) return

    try {
      historyManager.clearAllHistory()
      setHistory([])
    } catch (error) {
      console.error('清空历史记录失败:', error)
      alert('清空失败，请稍后重试。')
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050311] text-slate-100">
      <div className="stars-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.28),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(56,189,248,0.18),transparent_60%)]" />
      <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-purple-500/25 blur-[140px] animate-mystical-gradient" />
      <div className="absolute bottom-[-180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-[180px] animate-mystical-gradient" />

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 space-y-5">
              <div className="inline-flex items-center justify-center gap-3">
                <span className="text-4xl">📜</span>
                <h1 className="text-3xl md:text-4xl font-semibold font-[var(--font-display)] text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-violet-200 to-pink-200 drop-shadow-[0_10px_40px_rgba(124,58,237,0.45)]">
                  占卜历史
                </h1>
              </div>
              <p className="mx-auto max-w-2xl text-slate-200/80 text-sm md:text-base">
                回顾你与塔罗的每一次心灵对话，支持查看详细解读、删除单条记录或清空全部历史。
              </p>
            </div>

            <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-medium text-slate-200 backdrop-blur transition-all hover:border-white/40 hover:bg-white/10"
              >
                <span className="text-base">←</span>
                返回首页
              </button>
              <button
                onClick={handleClear}
                disabled={!history.length}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(232,121,249,0.45)] transition-all hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                <span className="text-base">🧹</span>
                清空历史
              </button>
            </div>

            {history.length === 0 ? (
              <div className="rounded-3xl border border-white/15 bg-white/5 p-10 text-center shadow-[0_35px_120px_rgba(76,29,149,0.45)] backdrop-blur-xl">
                <div className="mx-auto mb-6 h-20 w-20 rounded-full border border-dashed border-purple-400/60 bg-purple-500/10 flex items-center justify-center text-3xl">
                  🔮
                </div>
                <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-100 to-pink-100 mb-3">
                  还没有占卜历史
                </h2>
                <p className="text-sm text-slate-200/80" >
                  前往首页提出你的问题，与塔罗再度连结，我们会为你保留每一次独特的指引。
                </p>
                <div className="mt-8">
                  <button
                    onClick={() => router.push('/')}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 px-8 py-3 text-base font-semibold text-white shadow-[0_25px_65px_rgba(232,121,249,0.45)] transition-all duration-300 hover:scale-[1.04]"
                  >
                    <span className="text-lg">✨</span>
                    开始一次新的占卜
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-3xl border border-white/15 bg-white/5 p-6 md:p-8 shadow-[0_35px_120px_rgba(76,29,149,0.45)] backdrop-blur-xl"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-[0.3em] text-purple-200/60 mb-1">
                          占卜时间
                        </div>
                        <div className="text-lg font-semibold text-white font-[var(--font-display)]">
                          {formatTimestamp(entry.timestamp)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-slate-200 backdrop-blur transition-all hover:border-white/40 hover:bg-white/10"
                      >
                        <span className="text-base">🗑️</span>
                        删除这条记录
                      </button>
                    </div>

                    <div className="mt-6 space-y-3 text-sm text-slate-200/85">
                      <div>
                        <span className="text-purple-200 font-semibold">问题：</span>
                        {entry.question}
                      </div>
                      <div>
                        <span className="text-pink-200 font-semibold">牌阵：</span>
                        {entry.spreadName}
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {entry.drawnCards.map((card, index) => (
                        <div
                          key={`${entry.id}-${card.position.id}-${index}`}
                          className="rounded-2xl border border-white/10 bg-black/20 p-4 transition-all hover:border-purple-300/40 hover:shadow-[0_15px_45px_rgba(124,58,237,0.3)]"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div className="text-sm font-medium text-purple-200">
                              {card.position.name}
                            </div>
                            <div
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                card.isReversed
                                  ? 'bg-amber-500/20 text-amber-200'
                                  : 'bg-emerald-500/20 text-emerald-200'
                              }`}
                            >
                              {card.isReversed ? '逆位' : '正位'}
                            </div>
                          </div>

                          <div className="mb-1 text-base font-bold text-white">
                            {card.card.name}
                          </div>
                          <div className="mb-2 text-xs text-purple-200/70">
                            {card.card.englishName}
                          </div>
                          <div className="mb-3 text-xs leading-relaxed text-slate-300/70">
                            {card.position.description}
                          </div>

                          <div>
                            <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                              关键词
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {(card.isReversed
                                ? card.card.reversedKeywords
                                : card.card.uprightKeywords
                              )
                                .slice(0, 3)
                                .map((keyword, keywordIndex) => (
                                  <span
                                    key={`${entry.id}-${card.position.id}-${keywordIndex}`}
                                    className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[11px] text-purple-200"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8">
                      <div className="text-xs uppercase tracking-[0.3em] text-purple-200/60 mb-3">
                        塔罗解读
                      </div>
                      <div className="prose prose-invert max-w-none prose-headings:font-[var(--font-display)] prose-headings:text-white prose-p:text-slate-200 prose-p:leading-relaxed prose-strong:text-white prose-em:text-purple-300 prose-ul:text-slate-200 prose-ol:text-slate-200 prose-li:text-slate-200">
                        <ReactMarkdown components={markdownComponents}>
                          {entry.analysis}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
