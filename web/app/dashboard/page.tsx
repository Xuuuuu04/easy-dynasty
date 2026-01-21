'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import spreadsData from '../../data/spreads.json'
import { useToast } from '@/components/Toast'
import type { Spread } from '@/types/tarot'
import { TarotIcon } from '@/components/Icons'

export default function Dashboard() {
  const [question, setQuestion] = useState('')
  const [selectedSpread, setSelectedSpread] = useState<string>('')
  const [user, setUser] = useState<any>(null)
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        router.push('/');
        return;
    }
    fetchUser();
  }, [router]);

  const handleStartReading = () => {
    if (!question.trim()) {
      showToast('请输入您的问题', 'warning')
      return
    }
    if (!selectedSpread) {
      showToast('请选择一个牌阵', 'warning')
      return
    }
    sessionStorage.setItem('tarot_question', question)
    sessionStorage.setItem('tarot_spread', selectedSpread)
    router.push('/draw')
  }

  // Set default spread to first one if not set
  useEffect(() => {
      if (!selectedSpread && spreadsData.spreads.length > 0) {
          setSelectedSpread(spreadsData.spreads[0].id);
      }
  }, []);

  return (
    <div className="relative min-h-screen pt-20 pb-12 px-4 overflow-hidden bg-[#f5f5f0]">
      
      {/* Background Decos */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none overflow-hidden z-0 opacity-[0.05] md:opacity-[0.08]">
         <div className="absolute top-20 left-4 text-4xl writing-vertical font-serif">心诚则灵</div>
         <div className="absolute bottom-20 right-4 text-4xl writing-vertical font-serif">万象更生</div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col h-full justify-center min-h-[80vh]">
        
        {/* Compact Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-ink flex items-center justify-center gap-3">
            <span className="w-8 h-8 rounded-full border border-[#9a2b2b] flex items-center justify-center text-[#9a2b2b] text-sm">易</span>
            <span>塔罗启示</span>
          </h1>
          {user && (
              <div className="flex justify-center gap-4 mt-3 text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                  <span>塔罗额度: {user.tarot_limit - user.tarot_used_today}</span>
                  <span className="text-stone-300">|</span>
                  <span>八字额度: {user.bazi_limit - user.bazi_used_today}</span>
              </div>
          )}
        </div>

        {/* Question Input - Main Focus */}
        <div className="mb-8 animate-slide-up">
            <div className="ink-card p-1 bg-[#fffcf5] border-[#dcd9cd] shadow-md transition-all focus-within:shadow-lg focus-within:border-[#9a2b2b]/50">
                <div className="p-6 relative">
                    <label className="block text-center text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-4">心中所惑</label>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="在此输入您的问题..."
                        rows={1}
                        className="w-full bg-transparent border-none text-xl md:text-2xl text-center text-ink placeholder:text-stone-300 focus:outline-none focus:ring-0 resize-none font-serif leading-relaxed"
                        style={{ minHeight: '60px' }}
                    />
                </div>
            </div>
        </div>

        {/* Spreads - Horizontal Scroll / Compact Grid */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <label className="block text-center text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-4">选择牌阵</label>
            
            {/* Mobile: Horizontal Scroll */}
            <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-3 md:pb-0 px-1 custom-scrollbar snap-x snap-mandatory">
                {spreadsData.spreads.map((spread: Spread) => (
                    <div
                        key={spread.id}
                        onClick={() => setSelectedSpread(spread.id)}
                        className={`
                            flex-shrink-0 w-40 md:w-auto snap-center cursor-pointer transition-all duration-300
                            border rounded-sm p-4 flex flex-col items-center gap-2 relative
                            ${selectedSpread === spread.id 
                                ? 'bg-[#9a2b2b] border-[#9a2b2b] text-white shadow-md scale-105' 
                                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400 hover:shadow-sm'
                            }
                        `}
                    >
                        {/* Card Count Badge */}
                        <div className={`
                            absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border
                            ${selectedSpread === spread.id ? 'border-white/30 bg-white/10 text-white' : 'border-stone-200 bg-stone-50 text-stone-400'}
                        `}>
                            {spread.cardCount}
                        </div>

                        <div className={`text-2xl mt-2 ${selectedSpread === spread.id ? 'text-white/20' : 'text-stone-100'}`}>
                            ❖
                        </div>
                        
                        <h3 className="text-sm font-bold font-serif tracking-wide">{spread.name}</h3>
                        <p className={`text-[10px] uppercase tracking-wider ${selectedSpread === spread.id ? 'text-white/60' : 'text-stone-400'}`}>
                            {spread.englishName}
                        </p>
                    </div>
                ))}
            </div>
        </div>

        {/* Action Button - Always visible */}
        <div className="flex justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={handleStartReading}
              disabled={!question.trim()}
              className="btn-seal text-lg px-12 py-3.5 shadow-xl flex items-center gap-3 active:scale-95 transition-transform w-full md:w-auto justify-center"
            >
              <TarotIcon className="w-5 h-5" />
              <span>开始占卜</span>
            </button>
        </div>
        
        <p className="text-center text-[10px] text-stone-400 mt-6 font-serif italic">
            “心念所至，牌映所显”
        </p>

      </div>
    </div>
  )
}