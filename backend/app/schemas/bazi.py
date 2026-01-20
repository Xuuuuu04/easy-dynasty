from pydantic import BaseModel
from typing import List, Dict, Optional, TypedDict

class ShenShaInfo(BaseModel):
    """单个神煞的详细信息"""
    name: str  # 神煞名称
    type: str  # 吉凶类型: auspicious(吉), neutral-positive(中性偏吉), neutral-negative(中性偏凶), inauspicious(凶)
    level: int  # 重要程度: 1-5
    color: str  # Tailwind CSS颜色类
    bg: str  # 背景颜色类
    desc: str  # 简短描述

class BaziRequest(BaseModel):
    name: Optional[str] = "Unknown"
    gender: str = "male"
    birth_year: int
    birth_month: int
    birth_day: int
    birth_hour: int
    birth_minute: int = 0
    birth_place: Optional[str] = None # e.g. "北京"
    is_true_solar_time: bool = False # If true, skip corrections

    
class PillarInfo(BaseModel):
    gan: str
    zhi: str
    gan_wuxing: str
    zhi_wuxing: str
    hidden_gan: List[str] # 藏干
    shishen: str # 主星（天干十神）
    hidden_shishen: List[str] # 副星（藏干十神）
    nayim: str # 纳音
    xingyun: str # 星运（十二长生 - 针对日干）
    kongwang: str # 空亡状态 (e.g. "空") or empty
    shensha: List[str] = []  # 神煞名称列表（向后兼容）
    shensha_info: List[ShenShaInfo] = []  # 神煞详细信息（新字段）

class BaziChart(BaseModel):
    year_pillar: PillarInfo
    month_pillar: PillarInfo
    day_pillar: PillarInfo
    hour_pillar: PillarInfo
    
class WuxingAnalysis(BaseModel):
    scores: Dict[str, int]
    missing: List[str]
    strongest: str

class DaYunInfo(BaseModel):
    start_year: int
    end_year: int
    gan_zhi: str
    start_age: int

class BaziResponse(BaseModel):
    solar_date: str # The input/standard time
    true_solar_time: Optional[str] = None # The calculated True Solar Time
    lunar_date: str
    chart: BaziChart
    wuxing: WuxingAnalysis
    dayun: List[DaYunInfo] = []