from lunar_python import Solar, Lunar, EightChar
from app.schemas.bazi import BaziRequest, BaziResponse, BaziChart, PillarInfo, WuxingAnalysis, DaYunInfo, ShenShaInfo, LiuNianInfo
from app.services.location_service import get_coordinates_by_address
from app.services.shensha_engine import ShenShaEngine
from typing import List
import math
import datetime

def get_hidden_gan(zhi_char: str) -> List[str]:
    mapping = {
        "子": ["癸"], "丑": ["己", "癸", "辛"], "寅": ["甲", "丙", "戊"], 
        "卯": ["乙"], "辰": ["戊", "乙", "癸"], "巳": ["丙", "戊", "庚"],
        "午": ["丁", "己"], "未": ["己", "丁", "乙"], "申": ["庚", "壬", "戊"],
        "酉": ["辛"], "戌": ["戊", "辛", "丁"], "亥": ["壬", "甲"]
    }
    return mapping.get(zhi_char, [])

def calculate_shishen(day_master: str, target_gan: str) -> str:
    shishen_map = {
        "甲": {"甲": "比肩", "乙": "劫财", "丙": "食神", "丁": "伤官", "戊": "偏财", "己": "正财", "庚": "七杀", "辛": "正官", "壬": "偏印", "癸": "正印"},
        "乙": {"甲": "劫财", "乙": "比肩", "丙": "伤官", "丁": "食神", "戊": "正财", "己": "偏财", "庚": "正官", "辛": "七杀", "壬": "正印", "癸": "偏印"},
        "丙": {"甲": "偏印", "乙": "正印", "丙": "比肩", "丁": "劫财", "戊": "食神", "己": "伤官", "庚": "偏财", "辛": "正财", "壬": "七杀", "癸": "正官"},
        "丁": {"甲": "正印", "乙": "偏印", "丙": "劫财", "丁": "比肩", "戊": "伤官", "己": "食神", "庚": "正财", "辛": "偏财", "壬": "正官", "癸": "七杀"},
        "戊": {"甲": "七杀", "乙": "正官", "丙": "偏印", "丁": "正印", "戊": "比肩", "己": "劫财", "庚": "食神", "辛": "伤官", "壬": "偏财", "癸": "正财"},
        "己": {"甲": "正官", "乙": "七杀", "丙": "正印", "丁": "偏印", "戊": "劫财", "己": "比肩", "庚": "伤官", "辛": "食神", "壬": "正财", "癸": "偏财"},
        "庚": {"甲": "偏财", "乙": "正财", "丙": "七杀", "丁": "正官", "戊": "偏印", "己": "正印", "庚": "比肩", "辛": "劫财", "壬": "食神", "癸": "伤官"},
        "辛": {"甲": "正财", "乙": "偏财", "丙": "正官", "丁": "七杀", "戊": "正印", "己": "偏印", "庚": "劫财", "辛": "比肩", "壬": "伤官", "癸": "食神"},
        "壬": {"甲": "食神", "乙": "伤官", "丙": "偏财", "丁": "正财", "戊": "七杀", "己": "正官", "庚": "偏印", "辛": "正印", "壬": "比肩", "癸": "劫财"},
        "癸": {"甲": "伤官", "乙": "食神", "丙": "正财", "丁": "偏财", "戊": "正官", "己": "七杀", "庚": "正印", "辛": "偏印", "壬": "劫财", "癸": "比肩"},
    }
    return shishen_map.get(day_master, {}).get(target_gan, "")

def get_chang_sheng(gan: str, zhi: str) -> str:
    """
    Calculate 12 ChangSheng (Life Cycle) stages.
    """
    stages = ["长生", "沐浴", "冠带", "临官", "帝旺", "衰", "病", "死", "墓", "绝", "胎", "养"]
    
    # Gan mapping to start position (Zhi index) in clockwise rotation
    # Yang Gans usually move forward, Yin Gans backward.
    # Standard lookup table is easier.
    
    # Key: Heavenly Stem, Value: Zhi for 'ChangSheng'
    starts = {
        "甲": "亥", "丙": "寅", "戊": "寅", "庚": "巳", "壬": "申", # Yang
        "乙": "午", "丁": "酉", "己": "酉", "辛": "子", "癸": "卯"  # Yin
    }
    
    zhis = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
    
    if gan not in starts: return ""
    
    start_zhi = starts[gan]
    start_idx = zhis.index(start_zhi)
    curr_idx = zhis.index(zhi)
    
    yang_gans = ["甲", "丙", "戊", "庚", "壬"]
    
    if gan in yang_gans:
        # Forward
        diff = (curr_idx - start_idx + 12) % 12
    else:
        # Backward
        diff = (start_idx - curr_idx + 12) % 12
        
    return stages[diff]

def calculate_shensha(day_gan: str, day_zhi: str, year_zhi: str, curr_zhi: str) -> List[str]:
    """
    Calculate basic ShenSha (Gods and Evils) for a pillar.
    Based on Day Gan, Day Zhi, or Year Zhi.
    """
    shenshas = []
    
    # 1. Tian Yi Gui Ren (Day Gan / Year Gan) - usually Day Gan
    tian_yi = {
        "甲": ["丑", "未"], "戊": ["丑", "未"], "庚": ["丑", "未"],
        "乙": ["子", "申"], "己": ["子", "申"],
        "丙": ["亥", "酉"], "丁": ["亥", "酉"],
        "壬": ["巳", "卯"], "癸": ["巳", "卯"],
        "辛": ["午", "寅"]
    }
    if curr_zhi in tian_yi.get(day_gan, []): shenshas.append("天乙")
    
    # 2. Wen Chang (Day Gan)
    wen_chang = {
        "甲": "巳", "乙": "午", "丙": "申", "戊": "申",
        "丁": "酉", "己": "酉", "庚": "亥", "辛": "子",
        "壬": "寅", "癸": "卯"
    }
    if curr_zhi == wen_chang.get(day_gan): shenshas.append("文昌")
    
    # 3. Yi Ma (Traveling Horse) - Based on Year Zhi or Day Zhi (checking both is common)
    # San He: Shen-Zi-Chen -> Yin, Yin-Wu-Xu -> Shen, Si-You-Chou -> Hai, Hai-Mao-Wei -> Si
    yi_ma_map = {
        "申": "寅", "子": "寅", "辰": "寅",
        "寅": "申", "午": "申", "戌": "申",
        "巳": "亥", "酉": "亥", "丑": "亥",
        "亥": "巳", "卯": "巳", "未": "巳"
    }
    if curr_zhi == yi_ma_map.get(day_zhi) or curr_zhi == yi_ma_map.get(year_zhi):
        shenshas.append("驿马")
        
    # 4. Tao Hua (Peach Blossom)
    tao_hua_map = {
        "申": "酉", "子": "酉", "辰": "酉",
        "寅": "卯", "午": "卯", "戌": "卯",
        "巳": "午", "酉": "午", "丑": "午",
        "亥": "子", "卯": "子", "未": "子"
    }
    if curr_zhi == tao_hua_map.get(day_zhi) or curr_zhi == tao_hua_map.get(year_zhi):
        shenshas.append("桃花")
        
    # 5. Lu Shen (Day Gan) - Lin Guan stage
    lu_shen = {
        "甲": "寅", "乙": "卯", "丙": "巳", "丁": "午",
        "戊": "巳", "己": "午", "庚": "申", "辛": "酉",
        "壬": "亥", "癸": "子"
    }
    if curr_zhi == lu_shen.get(day_gan): shenshas.append("禄神")
    
    return list(set(shenshas)) # Dedup

def calculate_pillar_info(gan_zhi: str, day_gan: str = None, day_zhi: str = None, year_gan: str = None, year_zhi: str = None, month_zhi: str = None, is_day_pillar: bool = False, nayin_str: str = "") -> PillarInfo:
    gan = gan_zhi[0]
    zhi = gan_zhi[1]
    
    wuxing_map = {
        "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土", "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水",
        "子": "水", "丑": "土", "寅": "木", "卯": "木", "辰": "土", "巳": "火", "午": "火", "未": "土", "申": "金", "酉": "金", "戌": "土", "亥": "水"
    }
    
    hidden_gans = get_hidden_gan(zhi)
    
    # ShiShen
    shishen = calculate_shishen(day_gan, gan) if day_gan else "日主" if is_day_pillar else ""
    hidden_shishen = [calculate_shishen(day_gan, hg) for hg in hidden_gans] if day_gan else []
    xingyun = get_chang_sheng(day_gan, zhi) if day_gan else ""
    
    # ShenSha - Passing all context
    shensha = []
    shensha_info = []
    if day_gan and day_zhi and year_zhi:
        m_zhi = month_zhi if month_zhi else ""
        y_gan = year_gan if year_gan else ""
        shensha = ShenShaEngine.calculate(
            day_gan=day_gan,
            day_zhi=day_zhi,
            year_gan=y_gan,
            year_zhi=year_zhi,
            month_zhi=m_zhi,
            curr_gan=gan,
            curr_zhi=zhi,
            is_day=is_day_pillar
        )

        # 生成神煞详细信息
        from app.services.shensha_attrs import get_shensha_attrs
        for shen in shensha:
            attrs = get_shensha_attrs(shen)
            shensha_info.append(ShenShaInfo(
                name=shen,
                type=attrs["type"],
                level=attrs["level"],
                color=attrs["color"],
                bg=attrs["bg"],
                border_color=attrs.get("border_color", "border-gray-200"),
                desc=attrs["desc"]
            ))

    kongwang = "" 
    
    return PillarInfo(
        gan=gan,
        zhi=zhi,
        gan_wuxing=wuxing_map.get(gan, ""),
        zhi_wuxing=wuxing_map.get(zhi, ""),
        hidden_gan=hidden_gans,
        shishen=shishen,
        hidden_shishen=hidden_shishen,
        nayim=nayin_str,
        xingyun=xingyun,
        kongwang=kongwang,
        shensha=shensha,
        shensha_info=shensha_info
    )

def calculate_equation_of_time(dt: datetime.datetime) -> float:
    """
    Calculate Equation of Time (EOT) in minutes using high-precision Meeus algorithm.
    Accuracy: ~seconds.
    Source: Jean Meeus, Astronomical Algorithms, 2nd Ed.
    """
    # 1. Julian Day (JD)
    year, month, day = dt.year, dt.month, dt.day
    hour, minute, second = dt.hour, dt.minute, dt.second
    
    if month <= 2:
        year -= 1
        month += 12
        
    A = math.floor(year / 100)
    B = 2 - A + math.floor(A / 4)
    
    JD = math.floor(365.25 * (year + 4716)) + math.floor(30.6001 * (month + 1)) + day + B - 1524.5
    
    # Add time fraction
    JD += (hour + minute / 60 + second / 3600) / 24.0
    
    # 2. Time T measured in Julian Centuries from J2000.0
    T = (JD - 2451545.0) / 36525.0
    
    # 3. Geometric Mean Longitude of the Sun (L0)
    L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T**2
    L0 = L0 % 360
    
    # 4. Mean Anomaly of the Sun (M)
    M = 357.52911 + 35999.05029 * T - 0.0001537 * T**2
    M_rad = math.radians(M)
    
    # 5. Eccentricity of Earth's Orbit (e)
    e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T**2
    
    # 6. Equation of the Center (C)
    C = (1.914602 - 0.004817 * T - 0.000014 * T**2) * math.sin(M_rad) + \
        (0.019993 - 0.000101 * T) * math.sin(2 * M_rad) + \
        0.000289 * math.sin(3 * M_rad)
        
    # 7. True Longitude of the Sun (TrueL)
    TrueL = L0 + C
    
    # 8. Apparent Longitude (AppL) - correcting for nutation and aberration
    # Omega = Longitude of the Ascending Node of Moon
    Omega = 125.04 - 1934.136 * T
    Omega_rad = math.radians(Omega)
    AppL = TrueL - 0.00569 - 0.00478 * math.sin(Omega_rad)
    AppL_rad = math.radians(AppL)
    
    # 9. Mean Obliquity of the Ecliptic (epsilon0)
    epsilon0 = 23 + 26/60 + 21.448/3600 - (46.8150 * T + 0.00059 * T**2 - 0.001813 * T**3)/3600
    
    # 10. Corrected Obliquity (epsilon)
    epsilon = epsilon0 + 0.00256 * math.cos(Omega_rad)
    epsilon_rad = math.radians(epsilon)
    
    # 11. Calculate Equation of Time (E)
    # E = L0 - alpha (Right Ascension)
    # tan(alpha) = cos(epsilon) * tan(AppL)
    y = math.tan(epsilon_rad/2)**2
    
    # Meeus Formula (approx sequence)
    L0_rad = math.radians(L0)
    
    E_rad = y * math.sin(2 * L0_rad) - \
            2 * e * math.sin(M_rad) + \
            4 * e * y * math.sin(M_rad) * math.cos(2 * L0_rad) - \
            0.5 * y**2 * math.sin(4 * L0_rad) - \
            1.25 * e**2 * math.sin(2 * M_rad)
            
    # Result in minutes
    E_minutes = math.degrees(E_rad) * 4
    
    return E_minutes

async def analyze_bazi(req: BaziRequest) -> BaziResponse:
    print(f"DEBUG: analyze_bazi called with {req}")
    # 1. Base Solar Time (Standard Time or True Solar Time depending on input)
    try:
        solar_date_obj = datetime.datetime(req.birth_year, req.birth_month, req.birth_day, req.birth_hour, req.birth_minute)
        solar = Solar.fromYmdHms(req.birth_year, req.birth_month, req.birth_day, req.birth_hour, req.birth_minute, 0)
        print("DEBUG: Solar object created")
        
        # 2. True Solar Time Correction (Only if NOT already provided by user)
        if req.birth_place and not req.is_true_solar_time:
            print(f"DEBUG: Correction needed for {req.birth_place}")
            try:
                coords = await get_coordinates_by_address(req.birth_place)
                print(f"DEBUG: Coords: {coords}")
                if coords:
                    longitude, latitude = coords
                    
                    # A. Longitude Correction (Local Mean Time)
                    # 4 minutes per degree difference from 120 (Beijing Standard)
                    lon_offset_minutes = (longitude - 120) * 4
                    
                    # B. Equation of Time Correction (Apparent Solar Time)
                    # Corrects for the earth's elliptical orbit
                    eot_minutes = calculate_equation_of_time(solar_date_obj)
                    
                    total_offset_minutes = lon_offset_minutes + eot_minutes
                    print(f"DEBUG: Offsets - Lon: {lon_offset_minutes}, EoT: {eot_minutes}, Total: {total_offset_minutes}")
                    
                    # Apply correction
                    # Use timedelta which handles seconds/microseconds accurately
                    new_dt = solar_date_obj + datetime.timedelta(minutes=total_offset_minutes)
                    
                    # Re-create Solar object with True Solar Time, including Seconds
                    solar = Solar.fromYmdHms(new_dt.year, new_dt.month, new_dt.day, new_dt.hour, new_dt.minute, new_dt.second)
                    print(f"DEBUG: New Solar object created: {new_dt}")
                    
            except Exception as e:
                print(f"Warning: Failed to apply True Solar Time correction: {e}")
                import traceback
                traceback.print_exc()
                pass

        lunar = solar.getLunar()
        bazi_obj = lunar.getEightChar()
        bazi_obj.setSect(2) 
        print("DEBUG: Bazi object created")

        # 获取干支
        year_gz = bazi_obj.getYearGan() + bazi_obj.getYearZhi()
        month_gz = bazi_obj.getMonthGan() + bazi_obj.getMonthZhi()
        day_gz = bazi_obj.getDayGan() + bazi_obj.getDayZhi()
        hour_gz = bazi_obj.getTimeGan() + bazi_obj.getTimeZhi()
        print(f"DEBUG: Pillars - Y:{year_gz} M:{month_gz} D:{day_gz} H:{hour_gz}")

        day_gan = bazi_obj.getDayGan()
        day_zhi = bazi_obj.getDayZhi()
        year_gan = bazi_obj.getYearGan()
        year_zhi = bazi_obj.getYearZhi()
        month_zhi = bazi_obj.getMonthZhi()
        
        # Xun Kong (Void) based on Day Pillar
        day_xun_kong = bazi_obj.getDayXunKong() # e.g. "子丑"
        print(f"DEBUG: XunKong: {day_xun_kong}")
        
        # Nayin
        year_nayin = bazi_obj.getYearNaYin()
        month_nayin = bazi_obj.getMonthNaYin()
        day_nayin = bazi_obj.getDayNaYin()
        hour_nayin = bazi_obj.getTimeNaYin()
        
        # Helper to create PillarInfo
        def build_pillar(gz, nayin, is_day=False):
            p = calculate_pillar_info(
                gz, 
                day_gan=day_gan, 
                day_zhi=day_zhi, 
                year_gan=year_gan,
                year_zhi=year_zhi,
                month_zhi=month_zhi,
                is_day_pillar=is_day,
                nayin_str=nayin
            )
            # Check KongWang
            if p.zhi in day_xun_kong:
                p.kongwang = "空"
            return p

        chart = BaziChart(
            year_pillar=build_pillar(year_gz, year_nayin),
            month_pillar=build_pillar(month_gz, month_nayin),
            day_pillar=build_pillar(day_gz, day_nayin, is_day=True),
            hour_pillar=build_pillar(hour_gz, hour_nayin)
        )
        print("DEBUG: Chart created")
        
        # Wuxing
        all_chars = [
            chart.year_pillar.gan_wuxing, chart.year_pillar.zhi_wuxing,
            chart.month_pillar.gan_wuxing, chart.month_pillar.zhi_wuxing,
            chart.day_pillar.gan_wuxing, chart.day_pillar.zhi_wuxing,
            chart.hour_pillar.gan_wuxing, chart.hour_pillar.zhi_wuxing,
        ]
        scores = {"金": 0, "木": 0, "水": 0, "火": 0, "土": 0}
        for w in all_chars:
            if w in scores: scores[w] += 1
                
        missing = [k for k, v in scores.items() if v == 0]
        strongest = max(scores, key=scores.get) if scores else ""

        # DaYun
        yun = bazi_obj.getYun(1 if req.gender == 'male' else 0)
        dayun_list = []
        da_yun_arr = yun.getDaYun()
        for i in range(1, 9): 
            if i < len(da_yun_arr):
                dy = da_yun_arr[i]
                
                # Calculate LiuNian (Flowing Years) for this DaYun
                liunian_data = []
                try:
                    ln_arr = dy.getLiuNian()
                    for ln in ln_arr:
                        liunian_data.append(LiuNianInfo(
                            year=ln.getYear(),
                            age=ln.getAge(),
                            gan_zhi=ln.getGanZhi()
                        ))
                except Exception as e:
                    print(f"Error calculating LiuNian for DaYun {i}: {e}")
                
                dayun_list.append(DaYunInfo(
                    start_year=dy.getStartYear(),
                    end_year=dy.getEndYear(),
                    gan_zhi=dy.getGanZhi(),
                    start_age=dy.getStartAge(),
                    liunian_list=liunian_data
                ))

        # Format True Solar Time for display if correction was applied
        true_solar_str = None
        if req.birth_place:
            # solar object is now the True Solar Time object
            true_solar_str = f"{solar.getYear()}-{solar.getMonth():02d}-{solar.getDay():02d} {solar.getHour():02d}:{solar.getMinute():02d}:{solar.getSecond():02d}"

        print("DEBUG: Returning response")
        return BaziResponse(
            solar_date=f"{req.birth_year}-{req.birth_month:02d}-{req.birth_day:02d} {req.birth_hour:02d}:{req.birth_minute:02d}:00", # Original Input
            true_solar_time=true_solar_str,
            lunar_date=lunar.toString(),
            chart=chart,
            wuxing=WuxingAnalysis(
                scores=scores,
                missing=missing,
                strongest=strongest
            ),
            dayun=dayun_list
        )
    except Exception as e:
        print(f"CRITICAL ERROR in analyze_bazi: {e}")
        import traceback
        traceback.print_exc()
        raise e