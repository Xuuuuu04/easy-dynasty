'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import spreadsData from '../../data/spreads.json'
import { useToast } from '@/components/Toast'
import type { Spread } from '@/types/tarot'

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

  return (
    <div className="relative min-h-screen pt-24 pb-12 px-4 overflow-hidden">
      
      {/* Background Decos */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none overflow-hidden z-0 opacity-[0.08]">
         <div className="absolute top-20 left-10 text-6xl writing-vertical font-serif">万物皆有灵 占卜以通神</div>
         <div className="absolute top-40 right-20 text-5xl writing-vertical font-serif">如是心 如是见</div>
         <div className="absolute bottom-20 left-1/4 text-4xl writing-vertical font-serif">塔罗之镜 映照本心</div>
      </div>

      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-stone-900/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-stone-800/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* ... existing header ... */}
        {/* (I will replace the full content logic below to include the footer correctly) */}

        
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tight text-ink">
            <span className="block mb-2 text-[#9a2b2b] text-xl tracking-[0.5em] font-light">塔罗</span>
            心之所向
          </h1>
          <p className="text-stone-500 font-serif text-lg tracking-wide">
            于静谧中抽离，向内探寻智慧的启示
          </p>
          {user && (
              <div className="flex justify-center gap-4 mt-4">
                  <div className="bg-white/50 px-4 py-1.5 rounded-full border border-stone-200 text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="text-[#9a2b2b]">●</span> 塔罗额度: {user.tarot_limit - user.tarot_used_today} / {user.tarot_limit}
                  </div>
                  <div className="bg-white/50 px-4 py-1.5 rounded-full border border-stone-200 text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="text-[#9a2b2b]">●</span> 八字额度: {user.bazi_limit - user.bazi_used_today} / {user.bazi_limit}
                  </div>
              </div>
          )}
        </div>

        <div className="space-y-16">
          
          {/* Question Section */}
          <div className="ink-card p-1 max-w-3xl mx-auto animate-slide-up bg-[#fffcf5] border-[#dcd9cd]">
            <div className="p-8 md:p-10 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f5f5f0] px-4 text-stone-400 text-xs tracking-[0.2em] font-bold uppercase">
                Step 1 · 冥想与提问
              </div>
              
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="在此写下您心中的疑惑..."
                rows={2}
                className="w-full bg-transparent border-none text-2xl md:text-3xl text-center text-ink placeholder:text-stone-300 focus:outline-none focus:ring-0 resize-none py-4 font-serif leading-relaxed"
                style={{ backgroundImage: 'linear-gradient(transparent, transparent 49px, #e5e5e5 50px)', backgroundSize: '100% 50px', lineHeight: '50px' }}
              />
            </div>
          </div>

          {/* Spread Selection */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-center mb-10">
               <span className="bg-[#f5f5f0] px-4 text-stone-400 text-xs tracking-[0.2em] font-bold uppercase">Step 2 · 选择牌阵</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {spreadsData.spreads.map((spread: Spread) => (
                <div
                  key={spread.id}
                  onClick={() => setSelectedSpread(spread.id)}
                  className={`group relative cursor-pointer p-8 transition-all duration-500 border rounded-sm flex flex-col items-center text-center gap-4 ${
                    selectedSpread === spread.id
                      ? 'bg-[#fffcf5] border-stone-800 shadow-lg scale-[1.02]'
                      : 'bg-white/40 border-stone-200 hover:bg-white/70 hover:border-stone-400'
                  }`}
                >
                  <div className={`w-12 h-12 flex items-center justify-center rounded-full text-lg border mb-2 ${
                     selectedSpread === spread.id ? 'bg-stone-800 text-white border-stone-800' : 'bg-transparent text-stone-400 border-stone-300'
                  }`}>
                     {spread.cardCount}
                  </div>
                  
                  <div>
                    <h3 className={`text-xl font-serif font-bold mb-1 tracking-wide ${selectedSpread === spread.id ? 'text-ink' : 'text-stone-600'}`}>
                      {spread.name}
                    </h3>
                    <p className="text-xs font-sans uppercase tracking-widest text-stone-400">
                      {spread.englishName}
                    </p>
                  </div>
                  
                  <p className="text-sm text-stone-500 font-serif leading-relaxed max-w-xs">
                    {spread.description}
                  </p>

                  {selectedSpread === spread.id && (
                     <div className="absolute top-4 right-4 text-[#9a2b2b] opacity-20 transform rotate-12 border-2 border-[#9a2b2b] p-2 rounded-sm">
                        <span className="text-xs font-bold writing-vertical">已选定</span>
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action */}
          <div className="flex justify-center pb-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={handleStartReading}
              disabled={!question.trim() || !selectedSpread}
              className="btn-seal text-xl px-12 py-4 shadow-xl"
            >
              <span className="relative z-10">开启牌阵</span>
            </button>
          </div>

          <div className="max-w-3xl mx-auto text-center space-y-4 pb-12">
            <div className="h-px w-24 bg-stone-300 mx-auto"></div>
            <p className="text-stone-500 font-serif italic text-sm">“塔罗牌是一面镜子，它揭示的不是未来，而是你当下尚未觉察的内心。”</p>
            <div className="bg-white/40 backdrop-blur-sm p-6 rounded-sm border border-stone-200 shadow-sm">
                <p className="text-[10px] text-[#9a2b2b] leading-relaxed uppercase tracking-widest mb-2 font-bold">塔罗启示与心理指引</p>
                <p className="text-[11px] text-stone-600 leading-relaxed max-w-2xl mx-auto">
                    塔罗牌通过象征性的符号与原型，帮助我们建立与潜意识的对话。本系统生成的解读基于经典神秘学含义与 AI 深度分析，旨在提供多维度的视角与灵感。
                    任何结果都并非绝对的预言，真正的力量永远源于您当下的意志与行动。
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}