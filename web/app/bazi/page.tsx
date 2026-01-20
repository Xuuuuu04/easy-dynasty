'use client';

import { useState } from 'react';
import BaziChartDisplay from '@/components/BaziChart';
import Link from 'next/link';

export default function BaziPage() {
  const [formData, setFormData] = useState({
    birthDate: '2004-09-02',
    birthTime: '08:55',
    birthPlace: '', 
    gender: 'male',
    isTrueSolarTime: false // Added
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  // Geocoding state
  const [locationStatus, setLocationStatus] = useState<{
      msg: string, 
      coords?: {lng: number, lat: number}, 
      type: 'idle' | 'loading' | 'success' | 'error'
  }>({ msg: '', type: 'idle' });

  const handlePlaceBlur = async () => {
      if (!formData.birthPlace || formData.birthPlace.trim().length < 2) {
          setLocationStatus({ msg: '', type: 'idle' });
          return;
      }
      
      setLocationStatus({ msg: '正在定位...', type: 'loading' });
      
      try {
          console.log(`Geocoding request for: ${formData.birthPlace}`);
          const res = await fetch(`http://localhost:8000/api/v1/tools/geocode?address=${encodeURIComponent(formData.birthPlace)}`);
          console.log('Geocode response status:', res.status);
          
          if (res.ok) {
              const data = await res.json();
              console.log('Geocode data:', data);
              setLocationStatus({
                  msg: `已定位: 经度 ${data.longitude.toFixed(2)}, 纬度 ${data.latitude.toFixed(2)}`,
                  coords: { lng: data.longitude, lat: data.latitude },
                  type: 'success'
              });
          } else {
              console.error('Geocode failed:', await res.text());
              setLocationStatus({ msg: '未找到该地点，将使用平太阳时', type: 'error' });
          }
      } catch (e) {
          console.error('Geocode error:', e);
          setLocationStatus({ msg: '定位服务不可用 (请检查后端)', type: 'error' });
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      if (!formData.birthDate) {
        throw new Error("请选择出生日期");
      }

      const [year, month, day] = formData.birthDate.split('-').map(Number);
      const [hour, minute] = formData.birthTime.split(':').map(Number);

      const payload = {
        birth_year: year,
        birth_month: month,
        birth_day: day,
        birth_hour: hour,
        birth_minute: minute,
        birth_place: formData.birthPlace || undefined, 
        is_true_solar_time: formData.isTrueSolarTime, // Pass flag
        gender: formData.gender
      };

      const res = await fetch('http://localhost:8000/api/v1/bazi/calculate', {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('计算失败，请检查后端服务是否启动');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || '发生未知错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-8 px-4 font-serif text-stone-800">
      
      {/* Decorative Background Elements */}
      <div className="fixed top-20 left-10 text-9xl font-serif text-stone-900/5 select-none pointer-events-none z-0 writing-vertical-rl">
        命理
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="mb-10 flex items-center justify-between border-b border-stone-300 pb-4">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span className="bg-stone-800 text-white w-10 h-10 flex items-center justify-center rounded-sm text-lg">八</span>
              <span>四柱排盘</span>
            </h1>
            <div className="text-stone-500 italic text-sm">
                探寻先天命数，洞悉五行生克
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Input Form - Designed like a registry book */}
          <div className="w-full lg:w-1/3 bg-white/60 p-8 rounded-sm shadow-sm border border-stone-200">
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-stone-600 tracking-widest uppercase">出生日期 (公历)</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  className="w-full bg-transparent border-b-2 border-stone-300 p-2 text-lg text-stone-900 focus:outline-none focus:border-[#9a2b2b] transition-colors font-serif"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-bold text-stone-600 tracking-widest uppercase">出生时间</label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs select-none group">
                        <div className={`w-4 h-4 border transition-colors flex items-center justify-center rounded-sm ${formData.isTrueSolarTime ? 'bg-[#9a2b2b] border-[#9a2b2b]' : 'border-stone-400 group-hover:border-[#9a2b2b]'}`}>
                            {formData.isTrueSolarTime && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={formData.isTrueSolarTime}
                            onChange={(e) => setFormData({...formData, isTrueSolarTime: e.target.checked})}
                        />
                        <span className={`${formData.isTrueSolarTime ? 'text-[#9a2b2b] font-bold' : 'text-stone-500'}`}>
                            我已输入真太阳时
                        </span>
                    </label>
                </div>
                <input
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => setFormData({...formData, birthTime: e.target.value})}
                  className="w-full bg-transparent border-b-2 border-stone-300 p-2 text-lg text-stone-900 focus:outline-none focus:border-[#9a2b2b] transition-colors font-serif"
                />
                {formData.isTrueSolarTime && (
                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded mt-1">
                        ⚠️ 注意：勾选此项表示您输入的已经是经过经度和均时差校正的真太阳时，系统将不再进行自动校正。
                    </div>
                )}
              </div>

              {!formData.isTrueSolarTime && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="block text-sm font-bold text-stone-600 tracking-widest uppercase">
                        出生地点 <span className="text-xs font-normal text-stone-400 normal-case">(可选，用于真太阳时校正)</span>
                    </label>
                    <div className="relative">
                        <input
                          type="text"
                          placeholder="例如：北京、杭州、深圳市南山区"
                          value={formData.birthPlace}
                          onChange={(e) => setFormData({...formData, birthPlace: e.target.value})}
                          onBlur={handlePlaceBlur}
                          className="w-full bg-transparent border-b-2 border-stone-300 p-2 text-lg text-stone-900 focus:outline-none focus:border-[#9a2b2b] transition-colors font-serif placeholder:text-stone-300"
                        />
                        {locationStatus.type === 'loading' && (
                            <div className="absolute right-2 top-3 text-xs text-stone-400 animate-pulse">定位中...</div>
                        )}
                    </div>
                    {locationStatus.msg && (
                        <div className={`text-xs mt-1 ${
                            locationStatus.type === 'success' ? 'text-green-700' : 
                            locationStatus.type === 'error' ? 'text-amber-600' : 'text-stone-400'
                        }`}>
                            {locationStatus.msg}
                        </div>
                    )}
                  </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-bold text-stone-600 tracking-widest uppercase">性别</label>
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 border-2 flex items-center justify-center rounded-full ${formData.gender === 'male' ? 'border-[#9a2b2b]' : 'border-stone-400'}`}>
                        {formData.gender === 'male' && <div className="w-2.5 h-2.5 bg-[#9a2b2b] rounded-full" />}
                    </div>
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="hidden"
                    />
                    <span className="text-lg group-hover:text-[#9a2b2b] transition-colors">乾造 (男)</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 border-2 flex items-center justify-center rounded-full ${formData.gender === 'female' ? 'border-[#9a2b2b]' : 'border-stone-400'}`}>
                        {formData.gender === 'female' && <div className="w-2.5 h-2.5 bg-[#9a2b2b] rounded-full" />}
                    </div>
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="hidden"
                    />
                    <span className="text-lg group-hover:text-[#9a2b2b] transition-colors">坤造 (女)</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-stone-800 hover:bg-black text-white text-lg font-bold py-4 rounded-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2 group"
              >
                {loading ? (
                    <span>推算中...</span>
                ) : (
                    <>
                        <span>开始排盘</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </>
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-800 text-red-900 text-sm">
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Result Display Area */}
          <div className="w-full lg:w-2/3 min-h-[500px]">
             {result ? (
                 <BaziChartDisplay result={result} />
             ) : (
                 <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-stone-300 rounded-sm bg-white/30 p-12 text-center">
                     <div className="w-24 h-24 mb-6 opacity-20 bg-stone-800 rounded-full flex items-center justify-center text-4xl text-white">
                        ☯
                     </div>
                     <h3 className="text-2xl text-stone-500 font-serif mb-2">静候天机</h3>
                     <p className="text-stone-400 max-w-sm">
                         请输入左侧信息，系统将为您排出四柱八字，分析五行强弱。
                     </p>
                 </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}