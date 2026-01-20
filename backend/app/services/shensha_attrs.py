"""
神煞属性定义文件
定义每个神煞的吉凶属性和显示颜色
"""

# 神煞属性分类
SHENSHA_ATTRS = {
    # ========== 吉神 (Auspicious Stars) ==========
    "天乙": {"type": "auspicious", "level": 5, "color": "text-green-700", "bg": "bg-green-100", "desc": "最强吉神，逢凶化吉"},
    "太极": {"type": "auspicious", "level": 4, "color": "text-blue-700", "bg": "bg-blue-100", "desc": "聪明好学，正直有为"},
    "天官": {"type": "auspicious", "level": 4, "color": "text-indigo-700", "bg": "bg-indigo-100", "desc": "官星，有掌权之能"},
    "天厨": {"type": "auspicious", "level": 3, "color": "text-orange-700", "bg": "bg-orange-100", "desc": "食禄丰厚"},
    "福星": {"type": "auspicious", "level": 4, "color": "text-pink-700", "bg": "bg-pink-100", "desc": "福气满盈"},
    "文昌": {"type": "auspicious", "level": 4, "color": "text-purple-700", "bg": "bg-purple-100", "desc": "聪明好学，近贵利"},
    "国印": {"type": "auspicious", "level": 3, "color": "text-cyan-700", "bg": "bg-cyan-100", "desc": "掌印符，老实可靠"},
    "德秀": {"type": "auspicious", "level": 4, "color": "text-teal-700", "bg": "bg-teal-100", "desc": "内涵充实，温厚和气"},
    "三奇(天上)": {"type": "auspicious", "level": 5, "color": "text-red-600", "bg": "bg-red-100", "desc": "天上三奇，勋业超群"},
    "三奇(地下)": {"type": "auspicious", "level": 4, "color": "text-red-700", "bg": "bg-red-100", "desc": "地下三奇，贵不可言"},
    "三奇(人中)": {"type": "auspicious", "level": 4, "color": "text-red-700", "bg": "bg-red-100", "desc": "人中三奇，奇特异能"},
    "天赦": {"type": "auspicious", "level": 5, "color": "text-green-600", "bg": "bg-green-50", "desc": "逢凶化吉，最吉之神"},
    "天德": {"type": "auspicious", "level": 5, "color": "text-emerald-700", "bg": "bg-emerald-100", "desc": "日月会照，恺悌慈爱"},
    "天德合": {"type": "auspicious", "level": 4, "color": "text-emerald-600", "bg": "bg-emerald-50", "desc": "天德相合，福气倍增"},
    "月德": {"type": "auspicious", "level": 4, "color": "text-lime-700", "bg": "bg-lime-100", "desc": "太阴之德，化煞为权"},
    "月德合": {"type": "auspicious", "level": 3, "color": "text-lime-600", "bg": "bg-lime-50", "desc": "月德相合，诸事顺遂"},
    "天医": {"type": "auspicious", "level": 3, "color": "text-rose-700", "bg": "bg-rose-100", "desc": "健康平安，宜从医"},
    "禄神": {"type": "auspicious", "level": 5, "color": "text-amber-600", "bg": "bg-amber-100", "desc": "养命之源，爵禄丰厚"},
    "暗禄": {"type": "auspicious", "level": 2, "color": "text-amber-500", "bg": "bg-amber-50", "desc": "暗藏之禄，潜在福源"},
    "金舆": {"type": "auspicious", "level": 4, "color": "text-violet-700", "bg": "bg-violet-100", "desc": "富贵之征，出入有车"},
    "将星": {"type": "auspicious", "level": 4, "color": "text-indigo-600", "bg": "bg-indigo-100", "desc": "权力之星，把握权柄"},
    "学堂": {"type": "auspicious", "level": 3, "color": "text-blue-600", "bg": "bg-blue-100", "description": "好学上进，学业大展"},
    "词馆": {"type": "auspicious", "level": 3, "color": "text-blue-500", "bg": "bg-blue-50", "desc": "文章出众，才学过人"},

    # ========== 中性-偏吉 (Neutral-Positive) ==========
    "驿马": {"type": "neutral-positive", "level": 3, "color": "text-brown-600", "bg": "bg-brown-100", "desc": "动态之星，主奔波劳碌"},
    "桃花": {"type": "neutral-positive", "level": 3, "color": "text-pink-600", "bg": "bg-pink-100", "desc": "人缘魅力，情感丰富"},
    "咸池": {"type": "neutral-positive", "level": 3, "color": "text-pink-600", "bg": "bg-pink-100", "desc": "魅力异性，感情活跃"},
    "红艳": {"type": "neutral-positive", "level": 2, "color": "text-rose-600", "bg": "bg-rose-100", "desc": "多情重义，异性缘佳"},
    "红鸾": {"type": "neutral-positive", "level": 3, "color": "text-rose-700", "bg": "bg-rose-100", "desc": "婚姻喜庆，情缘美满"},
    "天喜": {"type": "neutral-positive", "level": 3, "color": "text-red-500", "bg": "bg-red-100", "desc": "喜庆快乐，婚嫁适宜"},

    # ========== 中性-偏凶 (Neutral-Negative) ==========
    "华盖": {"type": "neutral-negative", "level": 2, "color": "text-gray-500", "bg": "bg-gray-100", "desc": "艺术天分，但主孤独"},
    "魁罡": {"type": "neutral-negative", "level": 3, "color": "text-stone-600", "bg": "bg-stone-200", "desc": "刚强果断，掌权有威"},

    # ========== 凶煞 (Inauspicious Stars) ==========
    "羊刃": {"type": "inauspicious", "level": 5, "color": "text-red-700", "bg": "bg-red-100", "desc": "刚强暴戾，刑克六亲"},
    "飞刃": {"type": "inauspicious", "level": 4, "color": "text-red-600", "bg": "bg-red-50", "desc": "羊刃对冲，更加凶猛"},
    "流霞": {"type": "inauspicious", "level": 4, "color": "text-red-700", "bg": "bg-red-100", "desc": "血光之灾，易遭意外"},
    "劫煞": {"type": "inauspicious", "level": 5, "color": "text-red-800", "bg": "bg-red-200", "desc": "破财损耗，大耗又名"},
    "大耗": {"type": "inauspicious", "level": 4, "color": "text-red-700", "bg": "bg-red-100", "desc": "元辰大耗，破财失利"},
    "亡神": {"type": "inauspicious", "level": 4, "color": "text-orange-800", "bg": "bg-orange-200", "desc": "精神散漫，虚浮不实"},
    "灾煞": {"type": "inauspicious", "level": 5, "color": "text-red-900", "bg": "bg-red-300", "desc": "血光横死，水火防焚"},
    "孤辰": {"type": "inauspicious", "level": 3, "color": "text-slate-600", "bg": "bg-slate-100", "desc": "形孤肉露，不利六亲"},
    "寡宿": {"type": "inauspicious", "level": 3, "color": "text-slate-700", "bg": "bg-slate-200", "desc": "婚姻不顺，晚景凄凉"},
    "元辰": {"type": "inauspicious", "level": 3, "color": "text-stone-700", "bg": "bg-stone-200", "desc": "执拗自是，多遭挫折"},
    "空亡": {"type": "inauspicious", "level": 4, "color": "text-gray-600", "bg": "bg-gray-200", "desc": "力量减弱，福力减少"},
    "十恶大败": {"type": "inauspicious", "level": 5, "color": "text-red-900", "bg": "bg-red-400", "desc": "无禄日，遇之不吉"},
    "阴阳差错": {"type": "inauspicious", "level": 4, "color": "text-orange-700", "bg": "bg-orange-200", "desc": "婚姻不顺，与妻家不合"},
    "孤鸾": {"type": "inauspicious", "level": 4, "color": "text-purple-800", "bg": "bg-purple-200", "desc": "婚姻坎坷，晚景凄凉"},
    "四废": {"type": "inauspicious", "level": 3, "color": "text-gray-600", "bg": "bg-gray-200", "desc": "身弱多病，做事无成"},
    "十灵": {"type": "auspicious", "level": 4, "color": "text-violet-600", "bg": "bg-violet-100", "desc": "聪明灵异，技艺出众"},
    "金神": {"type": "neutral-negative", "level": 3, "color": "text-yellow-700", "bg": "bg-yellow-100", "desc": "刚断明敏，需火乡发越"},
    "天罗地网": {"type": "inauspicious", "level": 4, "color": "text-gray-700", "bg": "bg-gray-300", "desc": "牢狱灾伤，官司口舌"},
    "勾绞煞": {"type": "inauspicious", "level": 4, "color": "text-red-800", "bg": "bg-red-200", "desc": "刑狱缠身，口舌是非"},
    "丧门": {"type": "inauspicious", "level": 4, "color": "text-stone-700", "bg": "bg-stone-200", "desc": "孝丧之事，刑伤六亲"},
    "吊客": {"type": "inauspicious", "level": 4, "color": "text-stone-700", "bg": "bg-stone-200", "desc": "孝丧之事，不利健康"},
    "披麻": {"type": "inauspicious", "level": 3, "color": "text-stone-600", "bg": "bg-stone-200", "desc": "孝丧之痛，奔波劳碌"},
    "岁破": {"type": "inauspicious", "level": 4, "color": "text-red-700", "bg": "bg-red-200", "desc": "冲克年支，易生破财"},
    "三刑": {"type": "inauspicious", "level": 4, "color": "text-orange-700", "bg": "bg-orange-200", desc": "刑克太重，官府狱讼"},
}

# 简化分类，用于快速判断
SHENSHA_TYPE_COLORS = {
    "auspicious": "text-green-700 bg-green-100 border-green-300",
    "neutral-positive": "text-pink-700 bg-pink-100 border-pink-300",
    "neutral-negative": "text-gray-600 bg-gray-100 border-gray-300",
    "inauspicious": "text-red-700 bg-red-100 border-red-300",
}

def get_shensha_attrs(name: str) -> dict:
    """获取神煞属性"""
    # 处理带括号的特殊神煞（如三奇(天上)）
    base_name = name.split('(')[0] if '(' in name else name

    if base_name in SHENSHA_ATTRS:
        return SHENSHA_ATTRS[base_name]

    # 如果神煞不在列表中，根据关键词判断
    if any(keyword in name for keyword in ["贵", "德", "禄", "喜", "福", "文", "恩"]):
        return {"type": "auspicious", "level": 3, "color": "text-green-700", "bg": "bg-green-100", "desc": "贵人吉神"}
    elif any(keyword in name for keyword in ["刃", "煞", "煞", "亡", "劫", "灾", "刑", "冲", "破", "耗", "网", "勾", "绞", "丧", "吊", "披麻", "孤", "寡", "空", "败"]):
        return {"type": "inauspicious", "level": 3, "color": "text-red-700", "bg": "bg-red-100", "desc": "凶神恶煞"}
    else:
        return {"type": "neutral", "level": 2, "color": "text-gray-600", "bg": "bg-gray-100", "desc": "中性神煞"}

def get_shensha_color_style(name: str) -> str:
    """获取神煞的颜色样式字符串"""
    attrs = get_shensha_attrs(name)
    type_info = SHENSHA_TYPE_COLORS.get(attrs["type"], "text-gray-600 bg-stone-100 border-stone-300")
    return type_info
