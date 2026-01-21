'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'
import LegalAgreement from '@/components/LegalAgreement'

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  const [isReset, setIsReset] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [agreed, setAgreement] = useState(false)
  const [showLegalModal, setShowLegalModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [mounted, setMounted] = useState(false)
  
  const router = useRouter()
  const { showToast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleSendCode = async () => {
    if (!email) {
      showToast('请先输入邮箱', 'warning')
      return
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: isReset ? 'reset' : 'register' })
      })
      const data = await res.json()
      if (res.ok) {
        showToast('验证码已发送', 'success')
        setCooldown(60)
      } else {
        throw new Error(data.detail)
      }
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLogin && !agreed && !isReset) {
        showToast('请先阅读并同意用户协议', 'warning')
        return
    }
    setLoading(true)
    try {
        let res;
        let data;

        if (isReset) {
            res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, new_password: password })
            })
            data = await res.json()
            if (!res.ok) throw new Error(data.detail)
            showToast('密码重置成功，请登入', 'success')
            setIsReset(false)
            setIsLogin(true)
        } else if (isLogin) {
            res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ username, password })
            })
            data = await res.json()
            if (!res.ok) throw new Error(data.detail || '用户名或密码错误')
            localStorage.setItem('token', data.access_token)
            showToast('登录成功，正在开启命盘...', 'success')
            if (username === 'admin') router.push('/admin')
            else router.push('/dashboard')
        } else {
            res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, email, code })
            })
            data = await res.json()
            if (!res.ok) throw new Error(data.detail)
            showToast('注册成功，请登入', 'success')
            setIsLogin(true)
        }
    } catch (err: any) {
        showToast(err.message, 'error')
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#f5f5f0] text-stone-800 font-serif">
      
      {/* 1. Immersive Divination Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Base Paper Texture */}
          <div className="absolute inset-0 opacity-40 bg-[url('/rice-paper-2.png')]"></div>
          
          {/* Rotating Bagua Watermark */}
          <div className="absolute -top-[10%] -right-[10%] w-[70vw] h-[70vw] opacity-[0.04] animate-[spin_120s_linear_infinite]">
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                  <circle cx="50" cy="50" r="48" />
                  <circle cx="50" cy="50" r="35" />
                  {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                      <line key={deg} x1="50" y1="2" x2="50" y2="15" transform={`rotate(${deg} 50 50)`} />
                  ))}
                  <path d="M50 30 Q60 50 50 70 Q40 50 50 30" />
              </svg>
          </div>

          {/* Floating Tarot Card Outlines */}
          <div className="absolute top-[20%] left-[5%] w-32 h-56 border border-stone-900/10 rounded-lg rotate-[-15deg] animate-float opacity-30"></div>
          <div className="absolute bottom-[15%] right-[10%] w-40 h-64 border border-[#9a2b2b]/10 rounded-lg rotate-[12deg] animate-float-delayed opacity-30"></div>
          
          {/* Ink Wash Gradients */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-stone-200/30 via-transparent to-[#9a2b2b]/5"></div>
          
          {/* Ancient Seals (Static) */}
          <div className="absolute bottom-10 left-10 w-12 h-12 border-2 border-[#9a2b2b]/20 flex items-center justify-center text-[#9a2b2b]/20 text-xs font-bold leading-none select-none">
              <span className="writing-vertical">知命</span>
          </div>
          <div className="absolute bottom-24 left-10 w-8 h-8 border border-[#9a2b2b]/10 flex items-center justify-center text-[#9a2b2b]/10 text-[8px] font-bold leading-none select-none">
              <span className="writing-vertical">顺天</span>
          </div>
      </div>

      {/* 2. Main Glass Card Container */}
      <div className={`relative z-10 w-full max-w-[1050px] min-h-[620px] bg-white/70 backdrop-blur-2xl rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-white/60 flex overflow-hidden transition-all duration-1000 ease-out transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Left Side: Brand Art (Hidden on Mobile) */}
        <div className="hidden md:flex w-5/12 bg-stone-950 relative items-center justify-center p-12 overflow-hidden group">
            {/* Visual Depth Layers */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-800 to-black opacity-90"></div>
            <div className="absolute inset-0 opacity-10 bg-[url('/rice-paper-2.png')] mix-blend-overlay"></div>
            
            {/* Floating Calligraphy Elements */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[140%] h-[140%] border-[0.5px] border-white/5 rounded-full animate-[spin_100s_linear_infinite]"></div>
                <div className="w-[110%] h-[110%] border-[0.5px] border-white/5 rounded-full animate-[spin_80s_linear_infinite_reverse]"></div>
            </div>

            <div className="relative z-10 text-center space-y-10">
                <div className="w-28 h-28 mx-auto relative transform group-hover:scale-105 transition-transform duration-700">
                    {/* Shadow Glow */}
                    <div className="absolute inset-0 bg-[#9a2b2b] blur-2xl opacity-40 animate-pulse"></div>
                    {/* The Seal */}
                    <div className="relative w-full h-full bg-[#9a2b2b] rounded-sm flex items-center justify-center shadow-2xl border border-white/10">
                        <div className="w-[85%] h-[85%] border border-white/20 rounded-sm flex items-center justify-center">
                            <span className="text-white text-6xl font-bold font-serif select-none">易</span>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-3xl text-[#f5f5f0] tracking-[0.6em] font-serif font-light">易朝启示录</h2>
                        <p className="text-[10px] text-[#9a2b2b] uppercase tracking-[0.5em] font-bold">The Chronicles of Yi</p>
                    </div>
                    <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#9a2b2b]/50 to-transparent mx-auto"></div>
                    <p className="text-stone-400 text-xs tracking-[0.3em] leading-loose font-serif opacity-70">
                        观天之道 执天之行<br/>
                        于方寸卷轴<br/>
                        洞见命运之流转
                    </p>
                </div>
            </div>
            
            {/* Bottom Slogan Decoration */}
            <div className="absolute bottom-8 left-0 w-full text-center">
                <span className="text-[8px] text-stone-600 uppercase tracking-[0.8em] font-sans opacity-50">Fate · Wisdom · Enlightenment</span>
            </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col justify-center relative bg-white/30">
            {/* Mobile Branding */}
            <div className="md:hidden absolute top-10 left-0 w-full text-center">
                <div className="w-14 h-14 bg-[#9a2b2b] rounded-sm shadow-xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">易</div>
                <h1 className="text-xl font-bold text-ink tracking-[0.4em] uppercase">易朝 · 启示录</h1>
            </div>

            <div className="flex gap-10 mb-12 mt-20 md:mt-0 justify-center md:justify-start">
                {isReset ? (
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-[#9a2b2b] rounded-full"></div>
                        <span className="text-xl text-ink font-bold tracking-widest">找回口令</span>
                    </div>
                ) : (
                    <>
                        <button onClick={() => {setIsLogin(true); setIsReset(false);}} className={`pb-2 text-lg transition-all relative tracking-widest ${isLogin ? 'text-ink font-bold' : 'text-stone-400 hover:text-stone-600'}`}>
                            登入
                            {isLogin && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#9a2b2b] rounded-full"></div>}
                        </button>
                        <button onClick={() => {setIsLogin(false); setIsReset(false);}} className={`pb-2 text-lg transition-all relative tracking-widest ${!isLogin ? 'text-ink font-bold' : 'text-stone-400 hover:text-stone-600'}`}>
                            注册
                            {!isLogin && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#9a2b2b] rounded-full"></div>}
                        </button>
                    </>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 max-w-sm mx-auto md:mx-0">
                <div className="space-y-6">
                    {(isLogin || !isReset) && !isReset && (
                        <div className="relative group">
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="peer w-full bg-transparent border-b border-stone-300 py-3 text-ink text-base focus:outline-none focus:border-[#9a2b2b] transition-all placeholder-transparent" placeholder="雅号" id="username" />
                            <label htmlFor="username" className="absolute left-0 -top-3.5 text-stone-400 text-[10px] uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-[#9a2b2b]">雅号或信箱 / Account or Email</label>
                        </div>
                    )}

                    {(!isLogin || isReset) && (
                        <div className="relative group animate-fade-in">
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="peer w-full bg-transparent border-b border-stone-300 py-3 text-ink text-base focus:outline-none focus:border-[#9a2b2b] transition-all placeholder-transparent" placeholder="信箱" id="email" />
                            <label htmlFor="email" className="absolute left-0 -top-3.5 text-stone-400 text-[10px] uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-[#9a2b2b]">归属信箱 / Email Address</label>
                        </div>
                    )}

                    {(!isLogin || isReset) && (
                        <div className="flex gap-4 items-end animate-fade-in">
                            <div className="relative group flex-1">
                                <input type="text" value={code} onChange={e => setCode(e.target.value)} required className="peer w-full bg-transparent border-b border-stone-300 py-3 text-ink text-base focus:outline-none focus:border-[#9a2b2b] transition-all placeholder-transparent" placeholder="验证码" id="code" />
                                <label htmlFor="code" className="absolute left-0 -top-3.5 text-stone-400 text-[10px] uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-[#9a2b2b]">验证码 / Verification Code</label>
                            </div>
                            <button type="button" onClick={handleSendCode} disabled={cooldown > 0} className="text-[10px] text-[#9a2b2b] font-bold border border-[#9a2b2b]/30 px-4 py-2 hover:bg-[#9a2b2b]/5 disabled:opacity-50 min-w-[100px] tracking-widest rounded-sm uppercase">
                                {cooldown > 0 ? `${cooldown}s` : '获取码'}
                            </button>
                        </div>
                    )}

                    {!isLogin && (
                        <div className="relative group animate-fade-in">
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="peer w-full bg-transparent border-b border-stone-300 py-3 text-ink text-base focus:outline-none focus:border-[#9a2b2b] transition-all placeholder-transparent" placeholder="雅号" id="username_reg" />
                            <label htmlFor="username_reg" className="absolute left-0 -top-3.5 text-stone-400 text-[10px] uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-[#9a2b2b]">设定雅号 / Choose Username</label>
                        </div>
                    )}

                    <div className="relative group">
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="peer w-full bg-transparent border-b border-stone-300 py-3 text-ink text-base focus:outline-none focus:border-[#9a2b2b] transition-all placeholder-transparent tracking-widest" placeholder="口令" id="password" />
                        <label htmlFor="password" className="absolute left-0 -top-3.5 text-stone-400 text-[10px] uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-[#9a2b2b]">{isReset ? '新通行口令 / New Password' : '通行口令 / Password'}</label>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                    {!isReset ? (
                        <button type="button" onClick={() => setIsReset(true)} className="text-[10px] text-stone-400 hover:text-[#9a2b2b] transition-colors uppercase tracking-widest font-bold">忘记口令?</button>
                    ) : (
                        <button type="button" onClick={() => {setIsReset(false); setIsLogin(true);}} className="text-[10px] text-stone-400 hover:text-[#9a2b2b] transition-colors uppercase tracking-widest font-bold">← 返回登录</button>
                    )}
                    
                    {!isReset && !isLogin && (
                        <label className="flex items-center gap-2 cursor-pointer group select-none">
                            <div className={`w-3.5 h-3.5 border transition-all duration-300 flex items-center justify-center rounded-sm ${agreed ? 'bg-[#9a2b2b] border-[#9a2b2b]' : 'border-stone-300 group-hover:border-[#9a2b2b]'}`}>
                                {agreed && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            </div>
                            <input type="checkbox" className="hidden" checked={agreed} onChange={(e) => setAgreement(e.target.checked)} />
                            <span className="text-[10px] text-stone-500">同意 <span onClick={(e) => { e.stopPropagation(); setShowLegalModal(true); }} className="text-[#9a2b2b] underline">协议</span></span>
                        </label>
                    )}
                </div>

                <button type="submit" disabled={loading} className="group relative w-full bg-stone-900 text-[#f5f5f0] h-12 rounded-sm font-bold tracking-[0.4em] shadow-2xl overflow-hidden transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70">
                    <div className="absolute inset-0 bg-[#9a2b2b] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                    <span className="relative z-10 flex items-center justify-center gap-3">
                        {loading ? '演算中...' : (isReset ? '重置口令' : (isLogin ? '开启卷宗' : '刻录名册'))}
                        {!loading && <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>}
                    </span>
                </button>
            </form>

            <div className="mt-auto pt-12 flex justify-between items-center text-[9px] text-stone-400 font-sans tracking-[0.2em] uppercase opacity-50">
                <span>Yi Dynasty</span>
                <span>© 2026 Destiny Awaits</span>
            </div>
        </div>
      </div>

      <LegalAgreement isOpen={showLegalModal} onClose={() => setShowLegalModal(false)} />
    </div>
  )
}