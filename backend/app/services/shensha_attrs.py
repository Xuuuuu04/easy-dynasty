"""
神煞属性定义文件
定义每个神煞的吉凶属性和显示颜色
遵循 EasyDynasty 品牌的“水墨/朱砂”风格：
- 吉神：朱砂红 (Seal Red)
- 凶煞：墨灰色 (Ink Gray)
"""

# 定义品牌颜色变量（用于逻辑参考，实际返回给前端的是 Tailwind 类）
SEAL_RED_TEXT = "text-[#9a2b2b]"
SEAL_RED_BG = "bg-[#9a2b2b]/5"
SEAL_RED_BORDER = "border-[#9a2b2b]/20"

INK_GRAY_TEXT = "text-stone-500"
INK_GRAY_BG = "bg-stone-50"
INK_GRAY_BORDER = "border-stone-200"

# 神煞属性分类
# 这里的 color, bg 字段将被简化为品牌统一配色
SHENSHA_ATTRS = {
    # ========== 吉神 (Auspicious Stars) - 统一使用朱砂红 ==========
    "天乙": {"type": "auspicious", "level": 5, "desc": "最强吉神，逢凶化吉"},
    "太极": {"type": "auspicious", "level": 4, "desc": "聪明好学，正直有为"},
    "天官": {"type": "auspicious", "level": 4, "desc": "官星，有掌权之能"},
    "天厨": {"type": "auspicious", "level": 3, "desc": "食禄丰厚"},
    "福星": {"type": "auspicious", "level": 4, "desc": "福气满盈"},
    "文昌": {"type": "auspicious", "level": 4, "desc": "聪明好学，近贵利"},
    "国印": {"type": "auspicious", "level": 3, "desc": "掌印符，老实可靠"},
    "德秀": {"type": "auspicious", "level": 4, "desc": "内涵充实，温厚和气"},
    "三奇": {"type": "auspicious", "level": 5, "desc": "奇特异能，勋业超群"},
    "天赦": {"type": "auspicious", "level": 5, "desc": "逢凶化吉，最吉之神"},
    "天德": {"type": "auspicious", "level": 5, "desc": "日月会照，恺悌慈爱"},
    "天德合": {"type": "auspicious", "level": 4, "desc": "天德相合，福气倍增"},
    "月德": {"type": "auspicious", "level": 4, "desc": "太阴之德，化煞为权"},
    "月德合": {"type": "auspicious", "level": 3, "desc": "月德相合，诸事顺遂"},
    "天医": {"type": "auspicious", "level": 3, "desc": "健康平安，宜从医"},
    "禄神": {"type": "auspicious", "level": 5, "desc": "养命之源，爵禄丰厚"},
    "暗禄": {"type": "auspicious", "level": 2, "desc": "暗藏之禄，潜在福源"},
    "金舆": {"type": "auspicious", "level": 4, "desc": "富贵之征，出入有车"},
    "将星": {"type": "auspicious", "level": 4, "desc": "权力之星，把握权柄"},
    "学堂": {"type": "auspicious", "level": 3, "desc": "好学上进，学业大展"},
    "词馆": {"type": "auspicious", "level": 3, "desc": "文章出众，才学过人"},
    "十灵": {"type": "auspicious", "level": 4, "desc": "聪明灵异，技艺出众"},

    # ========== 中性-偏吉 (Neutral-Positive) - 统一使用浅朱砂红 ==========
    "驿马": {"type": "neutral-positive", "level": 3, "desc": "动态之星，主奔波劳碌"},
    "桃花": {"type": "neutral-positive", "level": 3, "desc": "人缘魅力，情感丰富"},
    "咸池": {"type": "neutral-positive", "level": 3, "desc": "魅力异性，感情活跃"},
    "红艳": {"type": "neutral-positive", "level": 2, "desc": "多情重义，异性缘佳"},
    "红鸾": {"type": "neutral-positive", "level": 3, "desc": "婚姻喜庆，情缘美满"},
    "天喜": {"type": "neutral-positive", "level": 3, "desc": "喜庆快乐，婚嫁适宜"},

    # ========== 凶煞 / 中性偏凶 (Inauspicious / Neutral-Negative) - 统一使用墨灰色 ==========
    "华盖": {"type": "neutral-negative", "level": 2, "desc": "艺术天分，但主孤独"},
    "魁罡": {"type": "neutral-negative", "level": 3, "desc": "刚强果断，掌权有威"},
    "羊刃": {"type": "inauspicious", "level": 5, "desc": "刚强暴戾，刑克六亲"},
    "飞刃": {"type": "inauspicious", "level": 4, "desc": "羊刃对冲，更加凶猛"},
    "流霞": {"type": "inauspicious", "level": 4, "desc": "血光之灾，易遭意外"},
    "劫煞": {"type": "inauspicious", "level": 5, "desc": "破财损耗，大耗又名"},
    "大耗": {"type": "inauspicious", "level": 4, "desc": "元辰大耗，破财失利"},
    "亡神": {"type": "inauspicious", "level": 4, "desc": "精神散漫，虚浮不实"},
    "灾煞": {"type": "inauspicious", "level": 5, "desc": "血光横死，水火防焚"},
    "孤辰": {"type": "inauspicious", "level": 3, "desc": "形孤肉露，不利六亲"},
    "寡宿": {"type": "inauspicious", "level": 3, "desc": "婚姻不顺，晚景凄凉"},
    "元辰": {"type": "inauspicious", "level": 3, "desc": "执拗自是，多遭挫折"},
    "空亡": {"type": "inauspicious", "level": 4, "desc": "力量减弱，福力减少"},
    "十恶大败": {"type": "inauspicious", "level": 5, "desc": "无禄日，遇之不吉"},
    "阴阳差错": {"type": "inauspicious", "level": 4, "desc": "婚姻不顺，与妻家不合"},
    "孤鸾": {"type": "inauspicious", "level": 4, "desc": "婚姻坎坷，晚景凄凉"},
    "四废": {"type": "inauspicious", "level": 3, "desc": "身弱多病，做事无成"},
    "金神": {"type": "neutral-negative", "level": 3, "desc": "刚断明敏，需火乡发越"},
    "天罗地网": {"type": "inauspicious", "level": 4, "desc": "牢狱灾伤，官司口舌"},
    "勾绞煞": {"type": "inauspicious", "level": 4, "desc": "刑狱缠身，口舌是非"},
    "丧门": {"type": "inauspicious", "level": 4, "desc": "孝丧之事，刑伤六亲"},
    "吊客": {"type": "inauspicious", "level": 4, "desc": "孝丧之事，不利健康"},
    "披麻": {"type": "inauspicious", "level": 3, "desc": "孝丧之痛，奔波劳碌"},
    "岁破": {"type": "inauspicious", "level": 4, "desc": "冲克年支，易生破财"},
    "三刑": {"type": "inauspicious", "level": 4, "desc": "刑克太重，官府狱讼"},
}

def get_shensha_attrs(name: str) -> dict:
    """获取神煞属性并应用统一品牌配色"""
    # 处理带括号的特殊神煞（如三奇(天上)）
    base_name = name.split('(')[0] if '(' in name else name

    attrs = None
    if base_name in SHENSHA_ATTRS:
        attrs = SHENSHA_ATTRS[base_name].copy()
    else:
        # 如果神煞不在列表中，根据关键词判断
        if any(keyword in name for keyword in ["贵", "德", "禄", "喜", "福", "文", "恩"]):
            attrs = {"type": "auspicious", "level": 3, "desc": "贵人吉神"}
        elif any(keyword in name for keyword in ["刃", "煞", "亡", "劫", "灾", "刑", "冲", "破", "耗", "网", "勾", "绞", "丧", "吊", "披麻", "孤", "寡", "空", "败"]):
            attrs = {"type": "inauspicious", "level": 3, "desc": "凶神恶煞"}
        else:
            attrs = {"type": "neutral", "level": 2, "desc": "中性神煞"}

    # 应用品牌统一配色
    if attrs["type"] in ["auspicious", "neutral-positive"]:
        attrs["color"] = SEAL_RED_TEXT
        attrs["bg"] = SEAL_RED_BG
        attrs["border_color"] = SEAL_RED_BORDER
    else:
        attrs["color"] = INK_GRAY_TEXT
        attrs["bg"] = INK_GRAY_BG
        attrs["border_color"] = INK_GRAY_BORDER
        
    return attrs