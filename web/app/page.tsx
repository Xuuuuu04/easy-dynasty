'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LegalAgreement from '@/components/LegalAgreement';

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false); // Toggle state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreed) {
        setError('请先阅读并同意用户协议');
        return;
    }

    setLoading(true);

    try {
      if (isRegister) {
         // Registration Logic
         const res = await fetch('http://localhost:8000/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
         });
         
         if (!res.ok) {
            const data = await res.json();
            throw new Error(data.detail || '注册失败');
         }
         
         // Auto login after register or ask user to login?
         // Let's ask user to login or auto-switch to login mode with success msg
         setIsRegister(false);
         setError('');
         alert('注册成功，请登录'); // Simple alert or Toast would be better
      } else {
         // Login Logic
         const formData = new URLSearchParams();
         formData.append('username', username);
         formData.append('password', password);

         const res = await fetch('http://localhost:8000/api/v1/auth/login', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
         });

         if (!res.ok) {
            throw new Error('用户名或密码错误');
         }

         const data = await res.json();
         localStorage.setItem('token', data.access_token);
         
         setTimeout(() => {
            if (username === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
         }, 500);
      }
    } catch (err: any) {
      setError(err.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f5f5f0] overflow-hidden flex flex-col items-center justify-center font-serif text-stone-800">
      
      {/* Background Ink Effects */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'url("/rice-paper-2.png")' }}></div>
      
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none overflow-hidden z-0 opacity-[0.08]">
         <div className="absolute top-20 left-10 text-6xl writing-vertical font-serif">天垂象 见吉凶</div>
         <div className="absolute top-40 right-20 text-5xl writing-vertical font-serif">命由天定 事在人为</div>
         <div className="absolute bottom-20 left-1/4 text-4xl writing-vertical font-serif">知易者 不占</div>
      </div>

      <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-stone-900/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-stone-800/5 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Main Content */}
      <div className="z-10 flex flex-col md:flex-row items-center gap-12 md:gap-24 animate-fade-in p-8">
        
        {/* Visual: Rotating Taiji & Vertical Text */}
        <div className="flex flex-col items-center gap-8">
          {/* Taiji Symbol */}
          <div className="relative w-48 h-48 md:w-64 md:h-64 animate-[spin_12s_linear_infinite]">
            <div className="absolute inset-0 rounded-full border-[1px] border-stone-300"></div>
            {/* Simple CSS Taiji */}
            <div className="w-full h-full rounded-full bg-gradient-to-b from-stone-900 via-stone-900 to-white relative overflow-hidden shadow-xl border-4 border-stone-800/10">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-white rounded-l-full origin-right scale-x-0"></div> 
               <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                 <path d="M50 0 A50 50 0 1 0 50 100 A50 50 0 1 1 50 0 Z" fill="#fffcf5" />
                 <path d="M50 0 A50 50 0 0 1 50 100 A25 25 0 0 1 50 50 A25 25 0 0 0 50 0 Z" fill="#1c1917" />
                 <circle cx="50" cy="25" r="6" fill="#fffcf5" />
                 <circle cx="50" cy="75" r="6" fill="#1c1917" />
               </svg>
            </div>
          </div>
          
          {/* Vertical Slogan */}
          <div className="hidden md:flex flex-row-reverse gap-6 h-64 text-2xl tracking-[0.5em] text-stone-800 font-medium" style={{ writingMode: 'vertical-rl' }}>
            <span className="border-l border-stone-300 pl-4">于墨香中探寻命运轨迹</span>
            <span className="border-l border-stone-300 pl-4">在静谧处聆听内心回响</span>
          </div>
        </div>

        {/* Auth Form Area */}
        <div className="w-full max-w-sm transition-all duration-500">
           <div className="mb-10 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <div className="absolute w-12 h-12 bg-[#9a2b2b] rounded-sm rotate-6"></div>
                  <span className="relative text-[#f5f5f0] text-2xl">易</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-[0.2em] text-stone-900 leading-none">启示录</h1>
              </div>
              <div className="text-base text-stone-400 tracking-[0.5em] uppercase font-light">Easy Dynasty</div>
           </div>

           <form onSubmit={handleAuth} className="space-y-8">
              <div className="space-y-6">
                <div className="group relative">
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="账号"
                    className="w-full bg-transparent border-b border-stone-300 py-2 text-lg focus:outline-none focus:border-stone-800 transition-colors placeholder:text-stone-300 text-stone-800"
                  />
                </div>
                <div className="group relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="密码"
                    className="w-full bg-transparent border-b border-stone-300 py-2 text-lg focus:outline-none focus:border-stone-800 transition-colors placeholder:text-stone-300 text-stone-800"
                  />
                </div>
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <input 
                    type="checkbox" 
                    id="agreement"
                    checked={agreed} 
                    onChange={e => setAgreed(e.target.checked)} 
                    className="accent-[#9a2b2b] cursor-pointer w-4 h-4"
                />
                <label htmlFor="agreement" className="cursor-pointer select-none">
                    我已阅读并同意 
                    <button 
                        type="button" 
                        onClick={() => setShowLegal(true)} 
                        className="text-[#9a2b2b] underline decoration-1 underline-offset-2 ml-1 hover:text-[#852222]"
                    >
                        《用户协议与隐私政策》
                    </button>
                </label>
              </div>

              {error && (
                <div className="text-xs text-[#9a2b2b] bg-[#9a2b2b]/5 p-2 rounded text-center animate-pulse">
                   {error}
                </div>
              )}

              <div className="pt-4 flex items-center justify-between">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="relative w-24 h-24 rounded-full bg-[#9a2b2b] text-[#f5f5f0] shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center group"
                >
                  <div className="absolute inset-1 border border-[#f5f5f0]/30 rounded-full"></div>
                  <span className="text-xl font-bold tracking-widest writing-vertical-rl group-hover:scale-110 transition-transform">
                    {loading ? '...' : (isRegister ? '注册' : '进入')}
                  </span>
                </button>
                
                <div className="text-right">
                    <button 
                        type="button"
                        onClick={() => { setIsRegister(!isRegister); setError(''); }}
                        className="text-sm text-stone-400 hover:text-stone-800 transition-colors underline decoration-stone-300 underline-offset-4"
                    >
                        {isRegister ? '已有账号？去登录' : '新用户？去注册'}
                    </button>
                </div>
              </div>
           </form>
           
           <div className="mt-12 text-center md:text-left text-xs text-stone-400 font-sans tracking-wide">
              © 2026 Easy Dynasty. All rights reserved.
           </div>
        </div>

        <LegalAgreement isOpen={showLegal} onClose={() => setShowLegal(false)} />

      </div>
    </div>
  );
}
