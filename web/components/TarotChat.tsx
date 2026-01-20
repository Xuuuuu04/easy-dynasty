'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { parseSSEStream } from '@/utils/sseParser'
import type { ChatMessage, ApiConfig } from '@/types/tarot'

interface TarotChatProps {
  initialHistory: ChatMessage[]
  apiConfig: ApiConfig
  endpoint?: string
  title?: string
}

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9a2b2b]">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

export default function TarotChat({ initialHistory, apiConfig, endpoint = '/api/v1/tarot/chat', title = '塔罗师对话' }: TarotChatProps) {
  const [history, setHistory] = useState<ChatMessage[]>(initialHistory)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
     if (initialHistory.length > 0) {
        setHistory(initialHistory)
     }
  }, [initialHistory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg: ChatMessage = { role: 'user', content: input.trim() }
    const newHistory = [...history, userMsg]
    setHistory(newHistory)
    setInput('')
    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: newHistory })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `API 错误: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      let assistantMsgContent = ''
      
      setHistory(prev => [...prev, { role: 'assistant', content: '' }])

      for await (const chunk of parseSSEStream(reader)) {
        const content = chunk.choices?.[0]?.delta?.content || chunk.content
        if (content) {
          assistantMsgContent += content
          setHistory(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: 'assistant', content: assistantMsgContent }
            return updated
          })
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setHistory(prev => [...prev, { role: 'assistant', content: '⚠️ 连接断开，请重试。' }])
    } finally {
      setIsLoading(false)
    }
  }

  // Only show follow-up messages (skip system, initial user, initial analysis)
  const followUpMessages = history.slice(3)

  return (
    <div className="mt-8 border-t border-stone-200 pt-8 animate-fade-in text-left">
       <h3 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
         <ChatIcon /> {title}
       </h3>
       
       <div className="space-y-6 mb-6 max-h-[400px] overflow-y-auto">
          {followUpMessages.map((msg, idx) => (
             <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                   msg.role === 'user'
                   ? 'bg-[#9a2b2b] text-[#f5f5f0] rounded-br-none'
                   : 'bg-white border border-stone-200 text-stone-800 rounded-bl-none'
                }`}>
                   <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-stone'}`}>
                     <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({ children }) => <h1 className="text-xl font-bold border-b border-current pb-1 mb-4">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-lg font-bold mt-6 mb-3">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-base font-bold mt-4 mb-2">{children}</h3>,
                            p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                            blockquote: ({ children }) => <blockquote className="border-l-4 border-[#9a2b2b] bg-stone-50/50 py-2 pl-4 italic my-4 rounded-r">{children}</blockquote>,
                            table: ({ children }) => <div className="overflow-x-auto my-4 border border-stone-200 rounded-sm shadow-sm"><table className="min-w-full divide-y divide-stone-200">{children}</table></div>,
                            thead: ({ children }) => <thead className="bg-stone-50">{children}</thead>,
                            th: ({ children }) => <th className="px-3 py-2 text-left text-xs font-bold text-stone-500 uppercase border-r border-stone-200 last:border-r-0">{children}</th>,
                            td: ({ children }) => <td className="px-3 py-2 text-xs text-stone-600 border-r border-stone-100 last:border-r-0">{children}</td>,
                            tr: ({ children }) => <tr className="divide-x divide-stone-100 even:bg-stone-50/50">{children}</tr>,
                        }}
                     >
                        {msg.content || '...'}
                     </ReactMarkdown>
                   </div>
                </div>
             </div>
          ))}
          {isLoading && (followUpMessages.length === 0 || followUpMessages[followUpMessages.length - 1]?.content !== '') && (
             <div className="flex justify-start">
                <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                   <div className="flex gap-1">
                      <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                      <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                   </div>
                </div>
             </div>
          )}
       </div>

       <form onSubmit={handleSubmit} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="对此次解读还有疑问？请继续提问..."
            className="w-full rounded-sm bg-white border border-stone-300 px-4 py-3 pr-12 text-stone-800 placeholder:text-stone-400 focus:border-[#9a2b2b] focus:outline-none focus:ring-1 focus:ring-[#9a2b2b]/50 transition-all font-serif"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-[#9a2b2b] disabled:opacity-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
       </form>
    </div>
  )
}
