import React from 'react';

// Types updated to match new backend response
interface PillarInfo {
  gan: string;
  zhi: string;
  gan_wuxing: string;
  zhi_wuxing: string;
  hidden_gan: string[];
  shishen: string;
  hidden_shishen: string[];
  nayim: string;
  xingyun: string;
  kongwang: string;
  shensha: string[];
}

interface DaYunInfo {
  start_year: number;
  end_year: number;
  gan_zhi: string;
  start_age: number;
}

interface BaziChartData {
  year_pillar: PillarInfo;
  month_pillar: PillarInfo;
  day_pillar: PillarInfo;
  hour_pillar: PillarInfo;
}

interface WuxingData {
  scores: Record<string, number>;
  missing: string[];
  strongest: string;
}

interface BaziResultProps {
  solar_date: string;
  true_solar_time?: string; 
  lunar_date: string;
  chart: BaziChartData;
  wuxing: WuxingData;
  dayun: DaYunInfo[];
}

// Professional Color Mapping
const ColorMap: Record<string, string> = {
    '金': 'text-amber-600',
    '木': 'text-emerald-700',
    '水': 'text-blue-700',
    '火': 'text-red-700',
    '土': 'text-stone-600',
};

const BgColorMap: Record<string, string> = {
    '金': 'bg-amber-500',
    '木': 'bg-emerald-600',
    '水': 'bg-blue-600',
    '火': 'bg-red-600',
    '土': 'bg-stone-500',
};

// Map Stem to Wuxing for coloring hidden elements
const StemWuxing: Record<string, string> = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

// Helper to get color from NaYin string
const getNaYinColor = (str: string) => {
    const element = ['金', '木', '水', '火', '土'].find(el => str.includes(el));
    return element ? ColorMap[element] : 'text-stone-600';
};

// Helper for professional table grid
const DataRow = ({ label, items, renderItem, labelClass = '' }: any) => (
    <div className="grid grid-cols-[4rem_1fr_1fr_1fr_1fr] border-b border-stone-200">
        <div className={`flex items-center justify-center bg-stone-50 font-bold text-stone-600 py-3 border-r border-stone-200 text-sm tracking-wide ${labelClass}`}>
            {label}
        </div>
        {[0, 1, 2, 3].map((idx) => (
            <div key={idx} className="flex flex-col items-center justify-center p-3 border-r border-stone-100 last:border-r-0">
                {renderItem(items[idx], idx)}
            </div>
        ))}
    </div>
);

export default function BaziChartDisplay({ result }: { result: BaziResultProps }) {
  
  const pillars = [
      result.chart.year_pillar,
      result.chart.month_pillar,
      result.chart.day_pillar,
      result.chart.hour_pillar
  ];

  return (
    <div className="w-full animate-fade-in font-serif text-stone-800 text-base">
      
      {/* Header Info - Larger Text */}
      <div className="bg-[#fffcf5] p-5 border border-stone-300 rounded-sm mb-8 flex flex-col md:flex-row gap-6 md:gap-12">
         <div className="flex flex-col gap-1">
             <span className="text-xs text-stone-400 font-bold tracking-widest uppercase">标准时间</span>
             <span className="font-bold text-lg md:text-xl">{result.solar_date}</span>
         </div>
         {result.true_solar_time && (
             <div className="flex flex-col gap-1">
                <span className="text-xs text-[#9a2b2b] font-bold tracking-widest uppercase">真太阳时</span>
                <span className="font-bold text-lg md:text-xl text-[#9a2b2b]">{result.true_solar_time}</span>
             </div>
         )}
         <div className="flex flex-col gap-1">
             <span className="text-xs text-stone-400 font-bold tracking-widest uppercase">农历历法</span>
             <span className="font-bold text-lg md:text-xl text-[#9a2b2b]">{result.lunar_date}</span>
         </div>
      </div>

      {/* Main Chart Table */}
      <div className="border border-stone-300 bg-white shadow-md mb-10 rounded-sm overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-[4rem_1fr_1fr_1fr_1fr] bg-stone-800 text-white text-sm font-bold border-b border-stone-300">
              <div className="py-3 text-center border-r border-white/10">项目</div>
              <div className="py-3 text-center">年柱</div>
              <div className="py-3 text-center">月柱</div>
              <div className="py-3 text-center">日柱</div>
              <div className="py-3 text-center">时柱</div>
          </div>

          {/* Row 1: ShiShen (Main Star) */}
          <DataRow 
            label="主星" 
            items={pillars}
            renderItem={(p: PillarInfo) => (
                <span className={`text-sm font-bold ${ColorMap[p.gan_wuxing]}`}>{p.shishen}</span>
            )}
          />

          {/* Row 2: Gan (Heavenly Stem) */}
          <DataRow 
            label="天干" 
            items={pillars}
            renderItem={(p: PillarInfo) => (
                <div className="flex flex-col items-center">
                    <span className={`text-4xl font-bold ${ColorMap[p.gan_wuxing]}`}>{p.gan}</span>
                    <span className={`text-[10px] mt-1 opacity-70 font-sans uppercase ${ColorMap[p.gan_wuxing]}`}>{p.gan_wuxing}</span>
                </div>
            )}
          />

          {/* Row 3: Zhi (Earthly Branch) */}
          <DataRow 
            label="地支" 
            items={pillars}
            renderItem={(p: PillarInfo) => (
                <div className="relative flex flex-col items-center w-full">
                    <span className={`text-4xl font-bold ${ColorMap[p.zhi_wuxing]}`}>{p.zhi}</span>
                    <span className={`text-[10px] mt-1 opacity-70 font-sans uppercase ${ColorMap[p.zhi_wuxing]}`}>{p.zhi_wuxing}</span>
                    {p.kongwang && (
                        <div className="absolute top-0 right-0 md:right-4 text-[10px] text-[#9a2b2b] border border-[#9a2b2b]/40 px-1 py-0.5 bg-white rounded-sm">
                            空
                        </div>
                    )}
                </div>
            )}
          />

          {/* Row 4: Hidden Gan (CangGan) */}
          <DataRow 
            label="藏干" 
            items={pillars}
            renderItem={(p: PillarInfo) => (
                <div className="flex flex-col gap-1 items-center">
                    {p.hidden_gan.map(g => (
                        <span key={g} className={`text-sm font-bold ${ColorMap[StemWuxing[g]]}`}>{g}</span>
                    ))}
                </div>
            )}
          />

          {/* Row 5: Hidden ShiShen (Sub Stars) */}
          <DataRow 
            label="副星" 
            items={pillars}
            renderItem={(p: PillarInfo) => (
                <div className="flex flex-col gap-1 items-center">
                    {p.hidden_shishen.map((s, i) => (
                        <span key={i} className={`text-xs ${ColorMap[StemWuxing[p.hidden_gan[i]]]}`}>{s}</span>
                    ))}
                </div>
            )}
          />
          
          {/* Row 6: NaYin */}
          <DataRow 
            label="纳音" 
            items={pillars}
            renderItem={(p: PillarInfo) => (
                <div className={`text-xs font-bold ${getNaYinColor(p.nayim)} whitespace-nowrap bg-stone-50 px-2 py-1 rounded`}>
                    {p.nayim}
                </div>
            )}
          />

          {/* Row 7: XingYun (Life Stage) */}
          <DataRow 
            label="星运" 
            items={pillars}
            renderItem={(p: PillarInfo) => (
                <span className="text-sm font-bold text-stone-700">{p.xingyun}</span>
            )}
          />

          {/* Row 8: ShenSha */}
          <DataRow 
            label="神煞" 
            items={pillars}
            renderItem={(p: PillarInfo) => (
                <div className="flex flex-wrap gap-1.5 justify-center">
                    {p.shensha.map(s => (
                        <span key={s} className={`text-xs px-1.5 py-0.5 rounded leading-tight whitespace-nowrap ${
                            s.includes('贵') || s.includes('德') || s.includes('禄') || s.includes('喜') 
                                ? 'text-[#9a2b2b] bg-[#9a2b2b]/5 border border-[#9a2b2b]/20' 
                                : 'text-stone-600 bg-stone-100 border border-stone-200'
                        }`}>
                            {s}
                        </span>
                    ))}
                </div>
            )}
          />
      </div>
    </div>
  );
}