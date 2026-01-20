'use client';

import { useState, useEffect, useRef } from 'react';
import BaziChartDisplay from '@/components/BaziChart';
import { useToast } from '@/components/Toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseSSEStream } from '@/utils/sseParser';
import TarotChat from '@/components/TarotChat';
import type { ChatMessage, ApiConfig } from '@/types/tarot';

import ExportReportModal from '@/components/ExportReportModal';

// Share Icon
const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
)

// Lock Icon
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
)

// Wuxing Component for Sidebar
const WuxingSidebar = ({ wuxing }: { wuxing: any }) => {
    const ColorMap: Record<string, string> = {
        '金': 'text-amber-600', '木': 'text-emerald-700', '水': 'text-blue-700', '火': 'text-red-700', '土': 'text-stone-600',
    };
    const BgColorMap: Record<string, string> = {
        '金': 'bg-amber-500', '木': 'bg-emerald-600', '水': 'bg-blue-600', '火': 'bg-red-600', '土': 'bg-stone-500',
    };

    return (
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="ink-card p-6 bg-white border-stone-200 shadow-sm">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] mb-6 border-b border-stone-100 pb-2">五行能量分布</h3>
                <div className="flex items-end justify-between h-32 px-2 gap-3">
                    {['金', '木', '水', '火', '土'].map((el) => {
                        const score = wuxing.scores[el] || 0;
                        const height = Math.max((score / 8) * 100, 5); 
                        return (
                            <div key={el} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                <div 
                                    className={`w-full ${BgColorMap[el]} rounded-t-sm shadow-sm transition-all duration-1000 ease-out`}
                                    style={{ height: `${height}%` }}
                                ></div>
                                <span className={`text-xs font-bold ${ColorMap[el]}`}>{el}</span>
                                <span className="text-[10px] text-stone-400">({score})</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="ink-card p-6 bg-[#fffcf5] border-stone-200 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">最强五行</span>
                        <div className={`text-xl font-bold ${ColorMap[wuxing.strongest]}`}>{wuxing.strongest}</div>
                    </div>
                    <div className="space-y-1 border-l border-stone-200 pl-4">
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">缺失五行</span>
                        <div className="text-xl font-bold text-stone-800">{wuxing.missing.join('、') || '无'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// DaYun Component for Sidebar
const DaYunSidebar = ({ dayun, tier }: { dayun: any[], tier: string }) => {
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

    const toggleExpand = (idx: number) => {
        setExpandedIdx(expandedIdx === idx ? null : idx);
    };

    return (
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em]">大运流年</h3>
                {tier === 'free' && <span className="text-[10px] text-[#9a2b2b] border border-[#9a2b2b] px-2 py-0.5 rounded-full">VIP</span>}
            </div>

            {tier === 'free' ? (
                <div className="ink-card p-6 bg-stone-50 border-stone-200 text-center flex flex-col items-center gap-2 shadow-sm">
                    <p className="text-stone-400 text-[10px] leading-relaxed">升级会员解锁完整大运流年分析</p>
                    <a href="/vip" className="text-[#9a2b2b] text-[10px] font-bold hover:underline">立即升级 →</a>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {dayun.map((dy, idx) => (
                        <div key={idx} className="transition-all duration-300">
                            {/* DaYun Header Card */}
                            <div 
                                onClick={() => toggleExpand(idx)}
                                className={`ink-card p-3 flex items-center justify-between cursor-pointer hover:border-[#9a2b2b] transition-all shadow-sm bg-white ${expandedIdx === idx ? 'border-[#9a2b2b] ring-1 ring-[#9a2b2b]/10' : 'border-stone-200'}`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-[9px] text-stone-400 font-bold">{dy.start_age}岁</span>
                                    <span className="text-[9px] text-stone-300">{dy.start_year}起</span>
                                </div>
                                <span className="text-xl font-bold text-ink font-serif">{dy.gan_zhi}</span>
                                <div className={`text-stone-300 transform transition-transform ${expandedIdx === idx ? 'rotate-180' : ''}`}>
                                    ▼
                                </div>
                            </div>

                            {/* LiuNian Expansion */}
                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedIdx === idx ? 'max-h-[400px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                                <div className="grid grid-cols-2 gap-2 pl-2">
                                    {dy.liunian_list && dy.liunian_list.map((ln: any, lIdx: number) => (
                                        <div key={lIdx} className="bg-stone-50/50 border border-stone-100 rounded-sm p-2 text-center flex flex-col">
                                            <span className="text-[10px] text-stone-400">{ln.year} ({ln.age}岁)</span>
                                            <span className="text-sm font-bold text-stone-700">{ln.gan_zhi}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ShenSha Component for Sidebar
const ShenShaSidebar = ({ chart }: { chart: any }) => {
    // Collect all unique ShenSha from pillars
    const allShenSha = new Set<string>();
    const shenshaDetails: any[] = [];
    
    [chart.year_pillar, chart.month_pillar, chart.day_pillar, chart.hour_pillar].forEach(p => {
        if (p.shensha_info) {
            p.shensha_info.forEach((s: any) => {
                if (!allShenSha.has(s.name)) {
                    allShenSha.add(s.name);
                    shenshaDetails.push(s);
                }
            });
        }
    });

    return (
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em]">命局神煞</h3>
            </div>
            
            <div className="ink-card p-4 bg-white border-stone-200 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    {shenshaDetails.length > 0 ? (
                        shenshaDetails.map((s, idx) => (
                            <span 
                                key={idx} 
                                className={`text-[10px] px-2 py-1 rounded-sm border font-bold ${ 
                                    s.type === '吉' 
                                    ? 'bg-red-50 text-[#9a2b2b] border-red-100'
                                    : s.type === '凶' 
                                    ? 'bg-stone-100 text-stone-500 border-stone-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                }`}
                                title={s.desc}
                            >
                                {s.name}
                            </span>
                        ))
                    ) : (
                        <span className="text-[10px] text-stone-400 italic">命局平稳，暂无显著神煞</span>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper to strip markdown code blocks if LLM adds them
const cleanAiResponse = (text: string) => {
    return text.replace(/^```markdown\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
};

export default function BaziPage() {
  const [formData, setFormData] = useState({
    birthDate: '2004-09-02',
    birthTime: '08:55',
    birthPlace: '', 
    gender: 'male',
    isTrueSolarTime: false
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [locationStatus, setLocationStatus] = useState<{type: 'loading'|'success'|'error'|'', msg: string}>({type: '', msg: ''});
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiSteps, setAiSteps] = useState<Array<{type: 'thought'|'action', content: string}>>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
      baseUrl: null,
      apiKey: null,
      model: 'moonshotai/Kimi-K2-Instruct-0905'
  });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const aiContainerRef = useRef<HTMLDivElement>(null);

  const { showToast } = useToast();

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setUser(data);
        }
    } catch (err) {
        console.error(err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Update chat history when analysis is complete
  useEffect(() => {
      if (!aiLoading && aiAnalysis && user?.tier === 'svip' && result) {
          const gender_str = formData.gender === 'male' ? '男' : '女';
          const current_date_str = "2026年1月20日";
          setChatHistory([
              { role: 'system', content: `你是一位专业的八字命理分析师。当前系统时间是${current_date_str}。` },
              { role: 'user', content: `性别：${gender_str}\n排盘数据：${JSON.stringify(result)}\n问题：请进行深度分析。` },
              { role: 'assistant', content: aiAnalysis }
          ]);
      }
  }, [aiLoading, aiAnalysis, user, result, formData.gender]);

  const handlePlaceBlur = async () => {
    if (!formData.birthPlace || formData.isTrueSolarTime) return;
    setLocationStatus({type: 'loading', msg: '正在定位经纬度...'});
    setTimeout(() => setLocationStatus({type: 'success', msg: '✓ 已记录地点'}), 800);
  };

  const calculate = async () => {
    setLoading(true);
    setAiAnalysis('');
    setAiSteps([]);
    try {
      const [year, month, day] = formData.birthDate.split('-').map(Number);
      const [hour, minute] = formData.birthTime.split(':').map(Number);
      const token = localStorage.getItem('token');
      const payload = {
        birth_year: year, birth_month: month, birth_day: day,
        birth_hour: hour, birth_minute: minute,
        birth_place: formData.birthPlace || undefined, 
        is_true_solar_time: formData.isTrueSolarTime, 
        gender: formData.gender
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/bazi/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: '计算服务异常' }));
          throw new Error(err.detail || '计算失败');
      }
      const data = await res.json();
      setResult(data);
      fetchUser();
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const runAiAnalysis = async () => {
    if (!user || user.tier === 'free') {
        showToast('AI 深度分析仅限 VIP/SVIP 用户使用', 'error');
        return;
    }
    
    setAiLoading(true);
    setAiAnalysis('');
    setAiSteps([{ type: 'thought', content: '正在开启天机，建立命理推演模型...' }]);
    
    try {
        const token = localStorage.getItem('token');
        const [year, month, day] = formData.birthDate.split('-').map(Number);
        const [hour, minute] = formData.birthTime.split(':').map(Number);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/v1/bazi/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                birth_year: year, birth_month: month, birth_day: day,
                birth_hour: hour, birth_minute: minute,
                birth_place: formData.birthPlace || undefined, 
                is_true_solar_time: formData.isTrueSolarTime, 
                gender: formData.gender,
                query: "请从格局、用神、大运流年等方面为我进行全面的命理分析。"
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: '分析引擎响应异常' }));
            throw new Error(err.detail || '分析失败');
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('无法读取响应流');

        let fullText = '';
        
        for await (const chunk of parseSSEStream(reader)) {
            if (chunk.type === 'thought' || chunk.type === 'action') {
                setAiSteps(prev => [...prev, { type: chunk.type as any, content: chunk.content || '' }]);
                continue;
            }

            const content = chunk.choices?.[0]?.delta?.content || chunk.content;
            if (content) {
                fullText += content;
                setAiAnalysis(fullText); // We update state with raw text, clean it in render
                if (aiContainerRef.current) {
                    aiContainerRef.current.scrollTop = aiContainerRef.current.scrollHeight;
                }
            }
        }
        fetchUser();
    } catch (err: any) {
        setAiAnalysis(prev => prev + `\n\n> ⚠️ **分析中断**: ${err.message}`);
        showToast(err.message, 'error');
    } finally {
        setAiLoading(false);
    }
  };

  const handleExportClick = () => {
      if (user?.tier === 'svip') {
          setIsExportModalOpen(true);
      } else {
          showToast('导出精美报告仅限 SVIP 用户使用，请升级解锁。', 'error');
      }
  };

  return (
    <div className="relative min-h-screen pt-24 pb-12 px-4 overflow-hidden text-left">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none overflow-hidden z-0 opacity-[0.08]">
         <div className="absolute top-20 left-10 text-6xl writing-vertical font-serif">夫命以干为禄 以支为命 以纳音为身</div>
         <div className="absolute top-40 right-20 text-5xl writing-vertical font-serif">五行者 往来乎天地之间而不穷者也</div>
         <div className="absolute bottom-20 left-1/4 text-4xl writing-vertical font-serif">四柱排定 荣枯自见</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12 space-y-4">
             <div className="inline-block border-y border-stone-800 py-2 px-6">
                <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-[0.2em] text-ink text-center">八字排盘</h1>
             </div>
             <p className="text-stone-500 font-serif tracking-widest text-sm text-center">四柱 · 神煞 · 五行 · 大运</p>
             {user && (
                 <div className="flex justify-center gap-4 mt-2">
                     <div className="bg-white/50 px-4 py-1.5 rounded-full border border-stone-200 text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2 shadow-sm">
                         <span className="text-[#9a2b2b]">●</span> 八字额度: {user.bazi_limit - user.bazi_used_today} / {user.bazi_limit}
                     </div>
                 </div>
             )}
        </div>

        <div className={`transition-all duration-700 w-full grid grid-cols-1 ${result ? 'lg:grid-cols-[320px_minmax(0,1fr)]' : 'max-w-xl mx-auto'} gap-8 items-start`}>
            <div className="space-y-8 lg:sticky lg:top-24">
                <div className={`ink-card p-6 md:p-8 bg-[#fffcf5] border border-[#dcd9cd] relative shadow-md`}>
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-[#9a2b2b] opacity-80"></div>
                  <div className="space-y-6 text-center">
                    <div className="flex justify-center gap-6 mb-4">
                       <label className="cursor-pointer group flex flex-col items-center gap-1.5">
                          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg transition-all ${formData.gender === 'male' ? 'border-stone-800 bg-stone-800 text-[#f5f5f0]' : 'border-stone-300 text-stone-400 group-hover:border-stone-500'}`}>乾</div>
                          <span className="text-[10px] text-stone-500 tracking-widest uppercase">男命</span>
                          <input type="radio" className="hidden" name="gender" value="male" checked={formData.gender === 'male'} onChange={() => setFormData({...formData, gender: 'male'})} />
                       </label>
                       <label className="cursor-pointer group flex flex-col items-center gap-1.5">
                          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg transition-all ${formData.gender === 'female' ? 'border-[#9a2b2b] bg-[#9a2b2b] text-[#f5f5f0]' : 'border-stone-300 text-stone-400 group-hover:border-[#9a2b2b]'}`}>坤</div>
                          <span className="text-[10px] text-stone-500 tracking-widest uppercase">女命</span>
                          <input type="radio" className="hidden" name="gender" value="female" checked={formData.gender === 'female'} onChange={() => setFormData({...formData, gender: 'female'})} />
                       </label>
                    </div>
                    <div className="space-y-5 text-left">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">公历日期</label>
                          <input type="date" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} className="ink-input !py-2 !text-base" />
                       </div>
                       <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">出生时间</label>
                                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] select-none group">
                                    <div className={`w-2.5 h-2.5 border transition-colors flex items-center justify-center rounded-sm ${formData.isTrueSolarTime ? 'bg-[#9a2b2b] border-[#9a2b2b]' : 'border-stone-400 group-hover:border-[#9a2b2b]'}`}>
                                        {formData.isTrueSolarTime && <div className="w-1 h-1 bg-white rounded-full"></div>}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={formData.isTrueSolarTime} onChange={(e) => setFormData({...formData, isTrueSolarTime: e.target.checked})} />
                                    <span className={`${formData.isTrueSolarTime ? 'text-[#9a2b2b] font-bold' : 'text-stone-400'}`}>真太阳时</span>
                                </label>
                            </div>
                            <input type="time" value={formData.birthTime} onChange={(e) => setFormData({...formData, birthTime: e.target.value})} className="ink-input !py-2 !text-base" />
                       </div>
                       {!formData.isTrueSolarTime && (
                          <div className="space-y-1.5 relative">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">出生地点</label>
                            <input type="text" placeholder="城市 / 区县" value={formData.birthPlace} onChange={(e) => setFormData({...formData, birthPlace: e.target.value})} onBlur={handlePlaceBlur} className="ink-input !py-2 !text-base" />
                            {locationStatus.msg && (
                                <div className={`absolute right-0 top-0 text-[9px] ${locationStatus.type === 'error' ? 'text-[#9a2b2b]' : 'text-emerald-700'}`}>{locationStatus.msg}</div>
                            )}
                          </div>
                       )}
                    </div>
                    <div className="space-y-3 pt-2 text-center">
                        <button onClick={calculate} disabled={loading} className="btn-seal w-full shadow-md py-2.5 text-base">{loading ? '推演中...' : '开始排盘'}</button>
                        {user && (
                            <div className="text-center">
                                <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">
                                    剩余: {user.bazi_limit - user.bazi_used_today} / {user.bazi_limit} 次
                                </span>
                            </div>
                        )}
                    </div>
                    {result && (
                        <button onClick={runAiAnalysis} disabled={aiLoading} className={`w-full py-2.5 rounded-sm text-sm font-bold tracking-widest transition-all border ${(!user || user.tier === 'free') ? 'bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed' : 'border-[#9a2b2b] text-[#9a2b2b] hover:bg-[#9a2b2b] hover:text-white shadow-sm'}`}>
                            {aiLoading ? '正在批命...' : (user?.tier === 'svip' ? '✦ 启示录 · 深度分析' : '✦ AI 智能分析')}
                        </button>
                    )}
                  </div>
                </div>
                {result && <WuxingSidebar wuxing={result.wuxing} />}
                {result && <DaYunSidebar dayun={result.dayun} tier={user?.tier || 'free'} />}
                {result && <ShenShaSidebar chart={result.chart} />}
            </div>

            <div className="space-y-12 min-w-0 max-w-full overflow-hidden text-left">
                {result && (
                    <div className="animate-ink-spread w-full overflow-x-auto custom-scrollbar pb-4">
                        <div className="min-w-[650px]">
                            <BaziChartDisplay result={result} />
                        </div>
                    </div>
                )}

                {(aiAnalysis || aiSteps.length > 0 || aiLoading) && (
                    <div className="ink-card p-6 md:p-10 animate-slide-up w-full text-left flex flex-col min-h-[500px]">
                        <div className="flex items-center gap-3 mb-8 border-b border-stone-200 pb-4">
                            <svg className="w-6 h-6 text-[#9a2b2b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <line x1="10" y1="9" x2="8" y2="9" />
                            </svg>
                            <h3 className="text-xl font-bold text-ink tracking-widest uppercase text-left font-display">
                                {user?.tier === 'svip' ? '易 · 深度启示' : 'AI · 命理分析'}
                            </h3>
                            
                            <button
                                onClick={handleExportClick}
                                className={`ml-auto px-3 py-1.5 rounded-sm border text-[10px] font-bold tracking-wider flex items-center gap-1.5 transition-all
                                    ${user?.tier === 'svip' 
                                        ? 'border-amber-500/50 text-amber-700 bg-amber-50/50 hover:bg-amber-100/50 hover:border-amber-600' 
                                        : 'border-stone-200 text-stone-400 bg-stone-50 hover:bg-stone-100'}`}
                            >
                                {user?.tier === 'svip' ? <ShareIcon /> : <LockIcon />}
                                导出
                            </button>
                        </div>

                        <div 
                            ref={aiContainerRef}
                            className="flex-1 max-h-[800px] overflow-y-auto scroll-smooth pr-2 custom-scrollbar"
                        >
                            {user?.tier === 'svip' && aiSteps.length > 0 && (
                                <div className="mb-10 space-y-3">
                                    {aiSteps.map((step, idx) => (
                                        <div key={idx} className="flex gap-3 animate-fade-in items-start group">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-1.5 h-1.5 rounded-full mt-2 ${step.type === 'thought' ? 'bg-stone-300' : 'bg-[#9a2b2b]'}`}></div>
                                                {idx < aiSteps.length - 1 && <div className="w-px h-full bg-stone-100 mt-1"></div>}
                                            </div>
                                            <div className={`text-[11px] leading-relaxed ${step.type === 'thought' ? 'text-stone-400 italic' : 'text-[#9a2b2b] font-medium'}`}>
                                                <span className="opacity-40 mr-1.5">[{step.type === 'thought' ? '推演' : '行动'}]</span>
                                                {step.content}
                                            </div>
                                        </div>
                                    ))}
                                    {aiLoading && !aiAnalysis && (
                                        <div className="flex gap-3 items-center pl-0.5">
                                            <div className="w-1 h-1 bg-[#9a2b2b] rounded-full animate-ping"></div>
                                            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em]">正在推演天机...</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {aiLoading && !aiAnalysis && aiSteps.length === 0 && (
                                <div className="py-20 text-center">
                                    <div className="relative mx-auto mb-8 h-20 w-20">
                                        <div className="absolute inset-0 rounded-full border-4 border-stone-200"></div>
                                        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#9a2b2b] border-r-stone-400"></div>
                                    </div>
                                    <div className="mb-3 text-lg font-bold text-ink animate-pulse">
                                        命理大师正在为您批命...
                                    </div>
                                    <div className="text-sm text-stone-500">
                                        推演八字格局与五行流转，请稍候
                                    </div>
                                </div>
                            )}

                            {/* Markdown Analysis Content */}
                            {aiAnalysis && (
                                <div className="prose prose-stone max-w-none text-left">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            h1: ({ children }) => (
                                                <h1 className="mb-6 text-2xl font-bold text-ink border-b-2 border-[#9a2b2b] pb-2 inline-block font-display">
                                                    {children}
                                                </h1>
                                            ),
                                            h2: ({ children }) => (
                                                <h2 className="mb-4 mt-8 text-xl font-bold text-ink border-b border-stone-300 pb-2 font-display">
                                                    {children}
                                                </h2>
                                            ),
                                            h3: ({ children }) => (
                                                <h3 className="mb-3 mt-6 text-lg font-bold text-[#9a2b2b] font-display">
                                                    {children}
                                                </h3>
                                            ),
                                            p: ({ children }) => (
                                                <p className="mb-4 leading-relaxed text-stone-700">
                                                    {children}
                                                </p>
                                            ),
                                            strong: ({ children }) => (
                                                <strong className="font-bold text-ink">
                                                    {children}
                                                </strong>
                                            ),
                                            em: ({ children }) => (
                                                <em className="text-[#9a2b2b] not-italic font-medium">{children}</em>
                                            ),
                                            ul: ({ children }) => (
                                                <ul className="mb-4 space-y-2 pl-6 text-stone-700 list-disc marker:text-[#9a2b2b]">
                                                    {children}
                                                </ul>
                                            ),
                                            ol: ({ children }) => (
                                                <ol className="mb-4 space-y-2 pl-6 text-stone-700 list-decimal marker:text-[#9a2b2b]">
                                                    {children}
                                                </ol>
                                            ),
                                            li: ({ children }) => (
                                                <li className="pl-1 leading-relaxed">{children}</li>
                                            ),
                                            blockquote: ({ children }) => (
                                                <blockquote className="my-6 border-l-4 border-[#9a2b2b] bg-stone-100/50 py-4 pl-6 italic text-stone-600 rounded-r-lg">
                                                    {children}
                                                </blockquote>
                                            ),
                                            table: ({ children }) => (
                                                <div className="overflow-x-auto my-8 border border-stone-200 rounded-sm shadow-sm">
                                                    <table className="min-w-full divide-y divide-stone-200">
                                                        {children}
                                                    </table>
                                                </div>
                                            ),
                                            thead: ({ children }) => <thead className="bg-stone-50">{children}</thead>,
                                            th: ({ children }) => (
                                                <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider border-r border-stone-200 last:border-r-0">
                                                    {children}
                                                </th>
                                            ),
                                            td: ({ children }) => (
                                                <td className="px-4 py-3 text-sm text-stone-600 border-r border-stone-100 last:border-r-0">
                                                    {children}
                                                </td>
                                            ),
                                            tr: ({ children }) => (
                                                <tr className="divide-x divide-stone-100 even:bg-stone-50/50">
                                                    {children}
                                                </tr>
                                            ),
                                        }}
                                    >
                                        {cleanAiResponse(aiAnalysis)}
                                    </ReactMarkdown>
                                </div>
                            )}

                            {/* Chat Interface (SVIP Only) */}
                            {!aiLoading && aiAnalysis && (
                                user?.tier === 'svip' ? (
                                    <TarotChat 
                                        initialHistory={chatHistory}
                                        apiConfig={apiConfig}
                                        endpoint="/api/v1/bazi/chat"
                                        title="命理大师对话"
                                    />
                                ) : (
                                    <div className="mt-12 border-t border-stone-200 pt-8 text-center bg-stone-50/50 rounded-sm p-6">
                                        <p className="text-stone-500 text-sm mb-2 text-center">想要针对此排盘进行深度追问？</p>
                                        <a href="/vip" className="text-[#9a2b2b] text-sm font-bold hover:underline flex items-center justify-center gap-1 text-center">
                                            升级高级 SVIP 开启大师对话功能 <span className="text-lg">→</span>
                                        </a>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto mt-24 pb-12">
        <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="h-px w-24 bg-stone-300 mx-auto"></div>
            <p className="text-stone-500 font-serif italic text-sm">“命自我作，福自我求。八字为指引，行止在人心。”</p>
            <div className="bg-white/40 backdrop-blur-sm p-6 rounded-sm border border-stone-200 shadow-sm">
                <p className="text-[10px] text-[#9a2b2b] leading-relaxed uppercase tracking-widest mb-2 font-bold">命理免责与成长指引</p>
                <p className="text-[11px] text-stone-600 leading-relaxed max-w-2xl mx-auto">
                    命理学是中国传统文化中探索人与自然关系的智慧总结。本系统生成的报告基于古籍逻辑与 AI 算法，仅供参考与心理指引。
                    真正的命运掌握在您的每一个选择与行动中。愿您在知命之后，更能勇于改命，活出精彩人生。
                </p>
            </div>
        </div>
      </div>
      
      {result && (
        <ExportReportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            type="bazi"
            data={{
                chart: result.chart,
                wuxing: result.wuxing,
                analysis: cleanAiResponse(aiAnalysis),
                gender: formData.gender,
                solarDate: result.solar_date
            }}
            userName={user?.username || 'Guest'}
        />
      )}
    </div>
  );
}