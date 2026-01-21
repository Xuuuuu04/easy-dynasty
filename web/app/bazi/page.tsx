'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BaziChartDisplay from '@/components/BaziChart';
import { useToast } from '@/components/Toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseSSEStream } from '@/utils/sseParser';
import TarotChat from '@/components/TarotChat';
import type { ChatMessage, ApiConfig } from '@/types/tarot';
import { ChartIcon, VipIcon, OrdersIcon, ArchiveIcon, CloseIcon } from '@/components/Icons';

import ExportReportModal from '@/components/ExportReportModal';
import { historyManager } from '@/utils/historyManager';
import { preprocessMarkdown } from '@/utils/markdown';

// Share Icon (Custom SVG)
const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
)

// Lock Icon (Custom SVG)
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
        <div className="space-y-4 md:space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="ink-card p-5 md:p-6 bg-white border-stone-200 shadow-sm">
                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-6 border-b border-stone-100 pb-2">五行能量分布</h3>
                <div className="flex items-end justify-between h-28 md:h-32 px-1 md:px-2 gap-2 md:gap-3">
                    {['金', '木', '水', '火', '土'].map((el) => {
                        const score = wuxing.scores[el] || 0;
                        const height = Math.max((score / 8) * 100, 5); 
                        return (
                            <div key={el} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                <div 
                                    className={`w-full ${BgColorMap[el]} rounded-t-sm shadow-sm transition-all duration-1000 ease-out`}
                                    style={{ height: `${height}%` }}
                                ></div>
                                <span className={`text-[10px] md:text-xs font-bold ${ColorMap[el]}`}>{el}</span>
                                <span className="text-[9px] text-stone-400">({score})</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="ink-card p-4 md:p-6 bg-[#fffcf5] border-stone-200 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">最强五行</span>
                        <div className={`text-lg md:text-xl font-bold ${ColorMap[wuxing.strongest]}`}>{wuxing.strongest}</div>
                    </div>
                    <div className="space-y-1 border-l border-stone-200 pl-4">
                        <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">缺失五行</span>
                        <div className="text-lg md:text-xl font-bold text-stone-800">{wuxing.missing.join('、') || '无'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// DaYun Component for Sidebar
const DaYunSidebar = ({ dayun, tier }: { dayun: any[], tier: string }) => {
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const toggleExpand = (idx: number) => setExpandedIdx(expandedIdx === idx ? null : idx);

    return (
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">大运流年</h3>
                {tier === 'free' && <span className="text-[9px] text-[#9a2b2b] border border-[#9a2b2b] px-2 py-0.5 rounded-full font-bold">VIP</span>}
            </div>

            {tier === 'free' ? (
                <div className="ink-card p-6 bg-stone-50 border-stone-200 text-center flex flex-col items-center gap-2 shadow-sm">
                    <p className="text-stone-400 text-[10px] leading-relaxed">升级会员解锁完整大运流年分析</p>
                    <a href="/vip" className="text-[#9a2b2b] text-[10px] font-bold hover:underline">立即升级 →</a>
                </div>
            ) : (
                <div className="flex flex-col gap-2 md:gap-3">
                    {dayun.map((dy, idx) => (
                        <div key={idx} className="transition-all duration-300">
                            <div 
                                onClick={() => toggleExpand(idx)}
                                className={`ink-card p-3 flex items-center justify-between cursor-pointer hover:border-[#9a2b2b] transition-all shadow-sm bg-white ${expandedIdx === idx ? 'border-[#9a2b2b] ring-1 ring-[#9a2b2b]/10' : 'border-stone-200'}`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-[8px] md:text-[9px] text-stone-400 font-bold">{dy.start_age}岁</span>
                                    <span className="text-[8px] md:text-[9px] text-stone-300">{dy.start_year}起</span>
                                </div>
                                <span className="text-lg md:text-xl font-bold text-ink font-serif">{dy.gan_zhi}</span>
                                <div className={`text-stone-300 transform transition-transform ${expandedIdx === idx ? 'rotate-180' : ''}`}>
                                    ▼
                                </div>
                            </div>

                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedIdx === idx ? 'max-h-[400px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                                <div className="grid grid-cols-2 gap-2 pl-2">
                                    {dy.liunian_list && dy.liunian_list.map((ln: any, lIdx: number) => (
                                        <div key={lIdx} className="bg-stone-50/50 border border-stone-100 rounded-sm p-2 text-center flex flex-col">
                                            <span className="text-[9px] text-stone-400">{ln.year} ({ln.age}岁)</span>
                                            <span className="text-xs font-bold text-stone-700">{ln.gan_zhi}</span>
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

const ShenShaSidebar = ({ chart }: { chart: any }) => {
    const allShenSha = new Set<string>();
    const shenshaDetails: any[] = [];
    [chart.year_pillar, chart.month_pillar, chart.day_pillar, chart.hour_pillar].forEach(p => {
        if (p.shensha_info) {
            p.shensha_info.forEach((s: any) => {
                if (!allShenSha.has(s.name)) { allShenSha.add(s.name); shenshaDetails.push(s); }
            });
        }
    });

    return (
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">命局神煞</h3>
            </div>
            <div className="ink-card p-4 bg-white border-stone-200 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    {shenshaDetails.length > 0 ? (
                        shenshaDetails.map((s, idx) => (
                            <span key={idx} className={`text-[9px] md:text-[10px] px-2 py-1 rounded-sm border font-bold ${ s.type === '吉' ? 'bg-red-50 text-[#9a2b2b] border-red-100' : s.type === '凶' ? 'bg-stone-100 text-stone-500 border-stone-200' : 'bg-amber-50 text-amber-700 border-amber-100' }`} title={s.desc}>
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

const cleanAiResponse = (text: string) => text.replace(/^```markdown\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');

export default function BaziPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ birthDate: '2004-09-02', birthTime: '08:55', birthPlace: '', gender: 'male', isTrueSolarTime: false });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [locationStatus, setLocationStatus] = useState<{type: 'loading'|'success'|'error'|'', msg: string}>({type: '', msg: ''});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiSteps, setAiSteps] = useState<Array<{type: 'thought'|'action', content: string}>>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({ baseUrl: null, apiKey: null, model: 'moonshotai/Kimi-K2-Instruct-0905' });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const aiContainerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/users/me`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setUser(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchProfiles = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/profiles/`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) setProfiles(await res.json());
      } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchUser();
    fetchProfiles();
  }, []);

  const handleProfileSelect = (p: any) => {
      setFormData({
          birthDate: `${p.birth_year}-${String(p.birth_month).padStart(2,'0')}-${String(p.birth_day).padStart(2,'0')}`,
          birthTime: `${String(p.birth_hour).padStart(2,'0')}:${String(p.birth_minute).padStart(2,'0')}`,
          birthPlace: p.birth_place || '',
          gender: p.gender,
          isTrueSolarTime: p.is_true_solar_time
      });
      setIsProfileModalOpen(false);
      showToast(`已导入: ${p.name}`, 'success');
  };

  useEffect(() => {
      if (!aiLoading && aiAnalysis && user?.tier === 'svip' && result) {
          const gender_str = formData.gender === 'male' ? '男' : '女';
          setChatHistory([
              { role: 'system', content: `你是一位专业的八字命理分析师。` },
              { role: 'user', content: `性别：${gender_str}\n排盘数据：${JSON.stringify(result)}\n问题：请进行深度分析。` },
              { role: 'assistant', content: aiAnalysis }
          ]);
      }
  }, [aiLoading, aiAnalysis, user, result, formData.gender]);

  const handlePlaceBlur = async () => {
    if (!formData.birthPlace || formData.isTrueSolarTime) return;
    setLocationStatus({type: 'loading', msg: '正在定位中...'});
    setTimeout(() => setLocationStatus({type: 'success', msg: '已记录地点'}), 800);
  };

  const calculate = async () => {
    setLoading(true); setAiAnalysis(''); setAiSteps([]);
    try {
      const [year, month, day] = formData.birthDate.split('-').map(Number);
      const [hour, minute] = formData.birthTime.split(':').map(Number);
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/bazi/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ birth_year: year, birth_month: month, birth_day: day, birth_hour: hour, birth_minute: minute, birth_place: formData.birthPlace || undefined, is_true_solar_time: formData.isTrueSolarTime, gender: formData.gender })
      });
      if (!res.ok) throw new Error('计算失败');
      setResult(await res.json());
      fetchUser();
    } catch (error: any) { showToast(error.message, 'error'); } finally { setLoading(false); }
  };

  const runAiAnalysis = async () => {
    if (!user || user.tier === 'free') { showToast('AI分析仅限VIP', 'error'); return; }
    setAiLoading(true); setAiAnalysis(''); setAiSteps([{ type: 'thought', content: '建立命理推演模型...' }]);
    try {
        const token = localStorage.getItem('token');
        const [year, month, day] = formData.birthDate.split('-').map(Number);
        const [hour, minute] = formData.birthTime.split(':').map(Number);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/bazi/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ birth_year: year, birth_month: month, birth_day: day, birth_hour: hour, birth_minute: minute, birth_place: formData.birthPlace || undefined, is_true_solar_time: formData.isTrueSolarTime, gender: formData.gender, query: "全面命理分析" })
        });
        const reader = response.body?.getReader();
        if (!reader) throw new Error('流读取失败');
        let fullText = '';
        for await (const chunk of parseSSEStream(reader)) {
            if (chunk.type === 'action') {
                setAiSteps(prev => [...prev, { type: 'action', content: chunk.content || '' }]);
                continue;
            }
            if (chunk.type === 'thought' || chunk.type === 'thought_stream') {
                setAiSteps(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.type === 'thought' && chunk.type === 'thought_stream') {
                        // 追加到最后一条 thought
                        const newSteps = [...prev];
                        newSteps[newSteps.length - 1] = { ...last, content: last.content + (chunk.content || '') };
                        return newSteps;
                    } else if (chunk.type === 'thought') {
                        // 新的 thought 步骤
                        return [...prev, { type: 'thought', content: chunk.content || '' }];
                    }
                    return prev;
                });
                continue;
            }
            const content = chunk.choices?.[0]?.delta?.content || chunk.content;
            if (content) { fullText += content; setAiAnalysis(fullText); if (aiContainerRef.current) aiContainerRef.current.scrollTop = aiContainerRef.current.scrollHeight; }
        }
        historyManager.saveReading("八字排盘", "", "", [], fullText, 'bazi', { birthDate: formData.birthDate, birthTime: formData.birthTime, gender: formData.gender, chart: result.chart, wuxing: result.wuxing });
        fetchUser();
    } catch (err: any) { setAiAnalysis(prev => prev + `\n\n> [!] **分析中断**: ${err.message}`); } finally { setAiLoading(false); }
  };

  const handleExportClick = () => {
    if (user?.tier === 'svip') {
        setIsExportModalOpen(true);
    } else {
        showToast('导出精美报告仅限 SVIP 用户使用，请升级解锁。', 'error');
    }
  };

  return (
    <div className="relative min-h-screen pt-20 md:pt-28 pb-12 px-4 overflow-hidden text-left bg-[#f5f5f0]">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none overflow-hidden z-0 opacity-[0.05] md:opacity-[0.08]">
         <div className="absolute top-20 left-4 md:left-10 text-4xl md:text-6xl writing-vertical font-serif">夫命以干为禄 以支为命</div>
         <div className="absolute top-40 right-4 md:right-20 text-3xl md:text-5xl writing-vertical font-serif">五行者 往来乎天地之间</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-2 md:px-4">
        <div className="text-center mb-8 md:mb-12 space-y-3 md:space-y-4 animate-fade-in">
             <div className="inline-block border-y border-stone-800 py-1 md:py-2 px-4 md:px-6">
                <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-[0.2em] text-ink text-center">八字排盘</h1>
             </div>
             <p className="text-stone-500 font-serif tracking-widest text-[10px] md:text-sm text-center uppercase">Pillars · Elements · Fortune</p>
        </div>

        <div className={`transition-all duration-700 w-full grid grid-cols-1 ${result ? 'lg:grid-cols-[300px_minmax(0,1fr)]' : 'max-w-xl mx-auto'} gap-6 md:gap-8 items-start`}>
            <div className="space-y-6 md:space-y-8 lg:sticky lg:top-24">
                <div className={`ink-card p-6 md:p-8 bg-[#fffcf5] border border-[#dcd9cd] relative shadow-md`}>
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-[#9a2b2b] opacity-80"></div>
                  
                  {/* Import Button */}
                  <button 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="absolute top-4 right-4 text-[10px] text-stone-400 hover:text-[#9a2b2b] border border-stone-200 rounded-sm px-2 py-1 flex items-center gap-1 transition-colors uppercase tracking-wider"
                  >
                    <ArchiveIcon className="w-3 h-3" /> 导入档案
                  </button>

                  <div className="space-y-6 text-center mt-6">
                    <div className="flex justify-center gap-6 mb-4">
                       <label className="cursor-pointer group flex flex-col items-center gap-1.5">
                          <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center text-base md:text-lg transition-all ${formData.gender === 'male' ? 'border-stone-800 bg-stone-800 text-[#f5f5f0]' : 'border-stone-300 text-stone-400 group-hover:border-stone-500'}`}>乾</div>
                          <span className="text-[9px] text-stone-500 tracking-widest uppercase font-bold">男命</span>
                          <input type="radio" className="hidden" name="gender" value="male" checked={formData.gender === 'male'} onChange={() => setFormData({...formData, gender: 'male'})} />
                       </label>
                       <label className="cursor-pointer group flex flex-col items-center gap-1.5">
                          <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center text-base md:text-lg transition-all ${formData.gender === 'female' ? 'border-[#9a2b2b] bg-[#9a2b2b] text-[#f5f5f0]' : 'border-stone-300 text-stone-400 group-hover:border-[#9a2b2b]'}`}>坤</div>
                          <span className="text-[9px] text-stone-500 tracking-widest uppercase font-bold">女命</span>
                          <input type="radio" className="hidden" name="gender" value="female" checked={formData.gender === 'female'} onChange={() => setFormData({...formData, gender: 'female'})} />
                       </label>
                    </div>
                    <div className="space-y-4 md:space-y-5 text-left font-serif">
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">公历日期</label>
                          <input type="date" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} className="ink-input !py-2 !text-sm md:!text-base" />
                       </div>
                       <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">出生时间</label>
                                <label className="flex items-center gap-1.5 cursor-pointer text-[9px] select-none group">
                                    <div className={`w-2 h-2 border transition-colors flex items-center justify-center rounded-sm ${formData.isTrueSolarTime ? 'bg-[#9a2b2b] border-[#9a2b2b]' : 'border-stone-400 group-hover:border-[#9a2b2b]'}`}>
                                        {formData.isTrueSolarTime && <div className="w-0.5 h-0.5 bg-white rounded-full"></div>}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={formData.isTrueSolarTime} onChange={(e) => setFormData({...formData, isTrueSolarTime: e.target.checked})} />
                                    <span className={`${formData.isTrueSolarTime ? 'text-[#9a2b2b] font-bold' : 'text-stone-400'}`}>真太阳时</span>
                                </label>
                            </div>
                            <input type="time" value={formData.birthTime} onChange={(e) => setFormData({...formData, birthTime: e.target.value})} className="ink-input !py-2 !text-sm md:!text-base" />
                       </div>
                       {!formData.isTrueSolarTime && (
                          <div className="space-y-1.5 relative">
                            <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">出生地点</label>
                            <input type="text" placeholder="城市 / 区县" value={formData.birthPlace} onChange={(e) => setFormData({...formData, birthPlace: e.target.value})} onBlur={handlePlaceBlur} className="ink-input !py-2 !text-sm md:!text-base" />
                            {locationStatus.msg && ( <div className={`absolute right-0 top-0 text-[8px] ${locationStatus.type === 'error' ? 'text-[#9a2b2b]' : 'text-emerald-700'}`}>{locationStatus.msg}</div> )}
                          </div>
                       )}
                    </div>
                    <div className="space-y-3 pt-2 text-center">
                        <button onClick={calculate} disabled={loading} className="btn-seal w-full shadow-md py-2.5 text-base">{loading ? '推演中...' : '开始排盘'}</button>
                    </div>
                    {result && (
                        <button onClick={runAiAnalysis} disabled={aiLoading} className={`w-full py-2.5 rounded-sm text-xs md:text-sm font-bold tracking-widest transition-all border ${(!user || user.tier === 'free') ? 'bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed' : 'border-[#9a2b2b] text-[#9a2b2b] hover:bg-[#9a2b2b] hover:text-white shadow-sm'}`}>
                            {aiLoading ? '正在批命...' : (user?.tier === 'svip' ? '启示录 · 深度分析' : 'AI 智能分析')}
                        </button>
                    )}
                  </div>
                </div>
                {result && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                    <WuxingSidebar wuxing={result.wuxing} />
                    <DaYunSidebar dayun={result.dayun} tier={user?.tier || 'free'} />
                    <ShenShaSidebar chart={result.chart} />
                </div>}
            </div>

            <div className="space-y-8 md:space-y-12 min-w-0 max-w-full overflow-hidden text-left">
                {result && (
                    <div className="animate-ink-spread w-full">
                        <BaziChartDisplay result={result} />
                    </div>
                )}

                {(aiAnalysis || aiSteps.length > 0 || aiLoading) && (
                    <div className="ink-card p-5 md:p-10 animate-slide-up w-full text-left flex flex-col min-h-[400px] border-stone-300">
                        <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
                            <ChartIcon className="w-5 h-5 text-[#9a2b2b]" />
                            <h3 className="text-lg md:text-xl font-bold text-ink tracking-widest uppercase font-serif">
                                {user?.tier === 'svip' ? '易朝 · 深度启示' : 'AI · 命理分析'}
                            </h3>
                            
                            <button onClick={handleExportClick} className={`ml-auto px-2 md:px-3 py-1.5 rounded-sm border text-[9px] font-bold tracking-wider flex items-center gap-1.5 transition-all ${user?.tier === 'svip' ? 'border-amber-500/50 text-amber-700 bg-amber-50/50 hover:bg-amber-100/50' : 'border-stone-200 text-stone-400 bg-stone-50'}`}>
                                {user?.tier === 'svip' ? <ShareIcon /> : <LockIcon />}
                                <span>导出</span>
                            </button>
                        </div>

                        <div ref={aiContainerRef} className="flex-1 max-h-[70vh] overflow-y-auto scroll-smooth pr-2 custom-scrollbar">
                            {user?.tier === 'svip' && aiSteps.length > 0 && (
                                <div className="mb-8 space-y-2">
                                    {aiSteps.map((step, idx) => (
                                        <div key={idx} className="flex gap-2 animate-fade-in items-start">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-1 h-1 rounded-full mt-1.5 ${step.type === 'thought' ? 'bg-stone-300' : 'bg-[#9a2b2b]'}`}></div>
                                                {idx < aiSteps.length - 1 && <div className="w-px h-full bg-stone-50 mt-1"></div>}
                                            </div>
                                            <div className={`text-[10px] leading-relaxed ${step.type === 'thought' ? 'text-stone-400 italic' : 'text-[#9a2b2b] font-medium'}`}> 
                                                <span className="opacity-30 mr-1">[{step.type === 'thought' ? '推演' : '行动'}]</span> {step.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {aiAnalysis && (
                                <div className="prose prose-stone max-w-none text-left font-serif">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                            h1: ({ children }) => <h1 className="mb-6 text-xl md:text-2xl font-bold text-ink border-b border-[#9a2b2b] pb-1 inline-block">{children}</h1>,
                                            h2: ({ children }) => <h2 className="mb-4 mt-8 text-lg md:text-xl font-bold text-ink border-b border-stone-200 pb-1">{children}</h2>,
                                            h3: ({ children }) => <h3 className="mb-2 mt-6 text-base md:text-lg font-bold text-[#9a2b2b]">{children}</h3>,
                                            p: ({ children }) => <p className="mb-4 leading-relaxed text-stone-700 text-sm md:text-base">{children}</p>,
                                            blockquote: ({ children }) => <blockquote className="my-6 border-l-2 border-[#9a2b2b] bg-stone-50 py-3 pl-5 italic text-stone-600 rounded-sm">{children}</blockquote>,
                                            table: ({ children }) => <div className="overflow-x-auto my-6 border border-stone-200 rounded-sm"><table className="min-w-full divide-y divide-stone-200 text-xs md:text-sm">{children}</table></div>,
                                            thead: ({ children }) => <thead className="bg-stone-50">{children}</thead>,
                                            tbody: ({ children }) => <tbody className="divide-y divide-stone-100 bg-white">{children}</tbody>,
                                            tr: ({ children }) => <tr className="divide-x divide-stone-100">{children}</tr>,
                                            th: ({ children }) => <th className="px-3 py-2 text-left font-bold text-stone-500 border-r border-stone-200 last:border-r-0">{children}</th>,
                                            td: ({ children }) => <td className="px-3 py-2 border-r border-stone-100 last:border-r-0">{children}</td>,
                                        }}
                                    >
                                        {preprocessMarkdown(cleanAiResponse(aiAnalysis))}
                                    </ReactMarkdown>
                                </div>
                            )}

                            {!aiLoading && aiAnalysis && (
                                user?.tier === 'svip' ? (
                                    <TarotChat initialHistory={chatHistory} apiConfig={apiConfig} endpoint="/api/v1/bazi/chat" title="命理大师对话" />
                                ) : (
                                    <div className="mt-10 border-t border-stone-100 pt-8 text-center bg-stone-50/30 rounded-sm p-4">
                                        <p className="text-stone-400 text-xs mb-2 italic">想要深度追问？</p>
                                        <button onClick={() => router.push('/vip')} className="text-[#9a2b2b] text-[10px] font-bold tracking-widest uppercase hover:underline flex items-center justify-center gap-1 mx-auto">
                                            升级 SVIP 开启大师对话 <span className="text-lg">→</span>
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto mt-16 md:mt-24 pb-12 px-4 text-center space-y-4 animate-fade-in">
          <div className="h-px w-16 md:w-24 bg-stone-300 mx-auto"></div>
          <p className="text-stone-500 font-serif italic text-xs md:text-sm">“命自我作，福自我求。八字为指引，行止在人心。”</p>
      </div>
      
      {result && (
        <ExportReportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} type="bazi" data={{ chart: result.chart, wuxing: result.wuxing, analysis: cleanAiResponse(aiAnalysis), gender: formData.gender, solarDate: result.solar_date }} userName={user?.username || 'Guest'} />
      )}

      {/* Profiles Modal */}
      {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsProfileModalOpen(false)}>
              <div className="bg-[#fffcf5] w-full max-w-md rounded-sm shadow-2xl border border-stone-200 p-6 relative max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
                      <CloseIcon className="w-5 h-5" />
                  </button>
                  <h3 className="text-xl font-bold text-ink mb-4 border-b border-stone-200 pb-2">选择档案导入</h3>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 p-1">
                      {profiles.length === 0 ? (
                          <div className="text-center py-8 text-stone-400">
                              <p className="text-sm">暂无存档</p>
                              <a href="/profiles" className="text-[#9a2b2b] text-xs underline mt-2 block">去添加档案</a>
                          </div>
                      ) : (
                          profiles.map(p => (
                              <div key={p.id} onClick={() => handleProfileSelect(p)} className="ink-card p-4 hover:border-[#9a2b2b]/50 cursor-pointer transition-all bg-white flex items-center justify-between group">
                                  <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${p.gender === 'male' ? 'border-stone-800 text-stone-800' : 'border-[#9a2b2b] text-[#9a2b2b]'}`}>
                                          {p.name[0]}
                                      </div>
                                      <div>
                                          <div className="font-bold text-ink text-sm">{p.name} <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 rounded ml-1">{p.relation}</span></div>
                                          <div className="text-[10px] text-stone-400">{p.birth_year}/{p.birth_month}/{p.birth_day} {String(p.birth_hour).padStart(2,'0')}:{String(p.birth_minute).padStart(2,'0')}</div>
                                      </div>
                                  </div>
                                  <span className="text-stone-300 group-hover:text-[#9a2b2b] opacity-0 group-hover:opacity-100 transition-all">导入</span>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
