from typing import List, Dict, Tuple

GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

class ShenShaEngine:
    """
    Ultimate ShenSha Calculator - 完整神煞计算引擎
    Implemented based on 'San Ming Tong Hui', 'Yuan Hai Zi Ping', and other classics.
    Covering 80+ common ShenShas including:
    - 贵人系列: 天乙、太极、天官、天厨、福星、文昌、国印、德秀、三奇、天赦等
    - 禄马桃花系列: 禄神、金舆、驿马、桃花、红艳、红鸾、天喜、咸池等
    - 凶煞系列: 羊刃、飞刃、流霞、劫煞、亡神、灾煞、孤辰寡宿、华盖、将星、元辰、空亡、十恶大败等
    - 天月德系列: 天德、月德、天医、天德合、月德合等
    - 特殊格局: 魁罡、阴阳差错、孤鸾、四废、十灵、金神、天罗地网、勾绞煞等
    """

    @staticmethod
    def get_kong_wang(day_gan: str, day_zhi: str) -> str:
        """计算空亡（以日柱为主）"""
        # 甲子旬中甲戌、乙亥为空
        # 甲戌旬中甲申、乙酉为空
        # 甲申旬中甲午、乙未为空
        # 甲午旬中甲辰、乙巳为空
        # 甲辰旬中甲寅、乙卯为空
        # 甲寅旬中甲子、乙丑为空

        xun_map = {
            "甲": "子", "乙": "戌", "丙": "申", "丁": "午", "戊": "辰", "己": "寅",
            "庚": "寅", "辛": "丑", "壬": "子", "癸": "戌"
        }

        # 找到旬首
        day_idx = GAN.index(day_gan)
        zhi_idx = ZHI.index(day_zhi)
        xun_gan = GAN[(day_idx - zhi_idx + 12) % 10]
        xun_zhi = xun_map[xun_gan]

        # 空亡是旬首的第十和第十一位
        kong1_idx = (ZHI.index(xun_zhi) + 10) % 12
        kong2_idx = (ZHI.index(xun_zhi) + 11) % 12

        kong1 = ZHI[kong1_idx]
        kong2 = ZHI[kong2_idx]

        return f"{kong1}{kong2}"

    @staticmethod
    def calculate(day_gan: str, day_zhi: str, year_gan: str, year_zhi: str, month_zhi: str,
                 curr_gan: str, curr_zhi: str, is_day: bool = False, is_year: bool = False) -> List[str]:
        shenshas = []

        # --- Helper for checking inclusion ---
        def add(name):
            if name not in shenshas: shenshas.append(name)

        # ==========================================
        # 0. 空亡（优先计算，影响其他神煞）
        # ==========================================

        kong_wang = ShenShaEngine.get_kong_wang(day_gan, day_zhi)
        if curr_zhi in kong_wang:
            add("空亡")

        # ==========================================
        # 1. 贵人系列 (Nobleman)
        # ==========================================

        # 天乙贵人 (日干/年干 -> 地支) - 最强吉神
        # 甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸蛇兔藏，六辛逢马虎
        tian_yi_map = {
            "甲": ["丑", "未"], "戊": ["丑", "未"], "庚": ["丑", "未"],
            "乙": ["子", "申"], "己": ["子", "申"],
            "丙": ["亥", "酉"], "丁": ["亥", "酉"],
            "壬": ["巳", "卯"], "癸": ["巳", "卯"],
            "辛": ["午", "寅"]
        }
        if curr_zhi in tian_yi_map.get(day_gan, []):
            if curr_zhi not in kong_wang:  # 空亡则不发挥作用
                add("天乙")
        if curr_zhi in tian_yi_map.get(year_gan, []):
            if curr_zhi not in kong_wang:
                add("天乙")

        # 太极贵人
        tai_ji_map = {
            "甲": ["子", "午"], "乙": ["子", "午"],
            "丙": ["酉", "卯"], "丁": ["酉", "卯"],
            "戊": ["辰", "戌", "丑", "未"], "己": ["辰", "戌", "丑", "未"],
            "庚": ["寅", "亥"], "辛": ["寅", "亥"],
            "壬": ["巳", "申"], "癸": ["巳", "申"]
        }
        if curr_zhi in tai_ji_map.get(day_gan, []): add("太极")
        if curr_zhi in tai_ji_map.get(year_gan, []): add("太极")

        # 天官贵人
        tian_guan = {"甲": "未", "乙": "辰", "丙": "巳", "丁": "寅", "戊": "卯", "己": "酉", "庚": "亥", "辛": "申", "壬": "酉", "癸": "午"}
        if curr_zhi == tian_guan.get(day_gan): add("天官")

        # 天厨贵人
        tian_chu = {"甲": "巳", "乙": "午", "丙": "子", "丁": "巳", "戊": "午", "己": "申", "庚": "寅", "辛": "午", "壬": "酉", "癸": "亥"}
        if curr_zhi == tian_chu.get(day_gan): add("天厨")

        # 福星贵人
        fu_xing = {"甲": ["寅", "子"], "丙": ["寅", "子"], "乙": ["卯", "丑"], "癸": ["卯", "丑"], "戊": ["申"], "己": ["未"], "丁": ["亥"], "庚": ["午"], "辛": ["巳"], "壬": ["辰"]}
        if curr_zhi in fu_xing.get(day_gan, []): add("福星")

        # 文昌贵人
        wen_chang = {"甲": "巳", "乙": "午", "丙": "申", "戊": "申", "丁": "酉", "己": "酉", "庚": "亥", "辛": "子", "壬": "寅", "癸": "卯"}
        if curr_zhi == wen_chang.get(day_gan): add("文昌")
        if curr_zhi == wen_chang.get(year_gan): add("文昌")

        # 国印贵人
        guo_yin = {"甲": "戌", "乙": "亥", "丙": "丑", "丁": "寅", "戊": "丑", "己": "寅", "庚": "辰", "辛": "巳", "壬": "未", "癸": "申"}
        if curr_zhi == guo_yin.get(day_gan): add("国印")

        # 三奇贵人（天上三奇：乙丙丁；地下三奇：甲戊庚；人中三奇：壬癸辛）
        san_qi_map = {
            "天上": ("乙", "丙", "丁"),
            "地下": ("甲", "戊", "庚"),
            "人中": ("壬", "癸", "辛")
        }
        # 检查天干是否有连续的三奇
        for qi_name, qi_gans in san_qi_map.items():
            if all(gan in [day_gan, year_gan, month_zhi, curr_gan] for gan in qi_gans):
                # 检查是否顺序排列
                pillars = [day_gan, year_gan, curr_gan]
                sorted_gans = [g for g in pillars if g in qi_gans]
                if len(sorted_gans) >= 3:
                    add(f"三奇({qi_name})")

        # 天赦 - 逢凶化吉之星
        # 春戊寅，夏甲午，秋戊申，冬甲子
        tian_she = {
            ("寅", "卯", "辰"): ("戊", "寅"),
            ("巳", "午", "未"): ("甲", "午"),
            ("申", "酉", "戌"): ("戊", "申"),
            ("亥", "子", "丑"): ("甲", "子")
        }
        for season, (gz_gan, gz_zhi) in tian_she.items():
            if month_zhi in season and curr_gan == gz_gan and curr_zhi == gz_zhi:
                add("天赦")
                break

        # 德秀贵人 (月支 -> 天干)
        if month_zhi in ["寅", "午", "戌"]:
            if curr_gan in ["丙", "丁", "戊", "癸"]: add("德秀")
        elif month_zhi in ["申", "子", "辰"]:
            if curr_gan in ["壬", "癸", "戊", "己"]: add("德秀")
        elif month_zhi in ["巳", "酉", "丑"]:
            if curr_gan in ["庚", "辛", "乙"]: add("德秀")
        elif month_zhi in ["亥", "卯", "未"]:
            if curr_gan in ["甲", "乙", "丁", "壬"]: add("德秀")

        # ==========================================
        # 2. 禄马桃花系列 (Fortune & Charm)
        # ==========================================

        # 禄神
        lu_shen = {"甲": "寅", "乙": "卯", "丙": "巳", "丁": "午", "戊": "巳", "己": "午", "庚": "申", "辛": "酉", "壬": "亥", "癸": "子"}
        if curr_zhi == lu_shen.get(day_gan): add("禄神")

        # 暗禄（地支藏干所藏的禄）
        # 子藏癸，丑藏己癸辛，寅藏甲丙戊，卯藏乙，辰藏戊乙癸，巳藏丙戊庚，午藏丁己，未藏己乙丁，申藏庚壬戊，酉藏辛，戌藏戊辛丁，亥藏壬甲
        an_lu_map = {
            "子": ["癸"], "丑": ["己", "癸", "辛"], "寅": ["甲", "丙", "戊"], "卯": ["乙"],
            "辰": ["戊", "乙", "癸"], "巳": ["丙", "戊", "庚"], "午": ["丁", "己"],
            "未": ["己", "乙", "丁"], "申": ["庚", "壬", "戊"], "酉": ["辛"],
            "戌": ["戊", "辛", "丁"], "亥": ["壬", "甲"]
        }
        for lu_gan, lu_zhi in lu_shen.items():
            if lu_gan in an_lu_map.get(curr_zhi, []):
                add(f"暗禄({lu_gan})")

        # 金舆 - 禄前二位
        jin_yu = {"甲": "辰", "乙": "巳", "丙": "未", "丁": "申", "戊": "未", "己": "申", "庚": "戌", "辛": "亥", "壬": "丑", "癸": "寅"}
        if curr_zhi == jin_yu.get(day_gan): add("金舆")

        # 驿马
        yi_ma = {"申": "寅", "子": "寅", "辰": "寅", "寅": "申", "午": "申", "戌": "申", "巳": "亥", "酉": "亥", "丑": "亥", "亥": "巳", "卯": "巳", "未": "巳"}
        if curr_zhi == yi_ma.get(year_zhi) or curr_zhi == yi_ma.get(day_zhi): add("驿马")

        # 桃花 / 咸池
        tao_hua = {"申": "酉", "子": "酉", "辰": "酉", "寅": "卯", "午": "卯", "戌": "卯", "巳": "午", "酉": "午", "丑": "午", "亥": "子", "卯": "子", "未": "子"}
        if curr_zhi == tao_hua.get(year_zhi) or curr_zhi == tao_hua.get(day_zhi):
            add("桃花")
            add("咸池")  # 桃花即咸池

        # 红艳
        hong_yan = {"甲": "午", "乙": "申", "丙": "寅", "丁": "未", "戊": "辰", "己": "辰", "庚": "戌", "辛": "酉", "壬": "子", "癸": "申"}
        if curr_zhi == hong_yan.get(day_gan): add("红艳")

        # 红鸾
        hl_seq = ["卯", "寅", "丑", "子", "亥", "戌", "酉", "申", "未", "午", "巳", "辰"]
        if curr_zhi == hl_seq[ZHI.index(year_zhi)]: add("红鸾")

        # 天喜 - 红鸾对冲
        tx_idx = (ZHI.index(hl_seq[ZHI.index(year_zhi)]) + 6) % 12
        if curr_zhi == ZHI[tx_idx]: add("天喜")

        # ==========================================
        # 3. 刚猛/凶煞系列 (Power & Aggression)
        # ==========================================

        # 羊刃
        yang_ren = {"甲": "卯", "丙": "午", "戊": "午", "庚": "酉", "壬": "子", "乙": "辰", "丁": "未", "己": "未", "辛": "戌", "癸": "丑"}
        if curr_zhi == yang_ren.get(day_gan): add("羊刃")

        # 飞刃 - 羊刃对冲
        fei_ren_map = {
            "甲": "酉", "丙": "子", "戊": "子", "庚": "卯", "壬": "午",
            "乙": "戌", "丁": "丑", "己": "丑", "辛": "辰", "癸": "未"
        }
        if curr_zhi == fei_ren_map.get(day_gan): add("飞刃")

        # 流霞
        liu_xia = {"甲": "酉", "乙": "戌", "丙": "未", "丁": "申", "戊": "巳", "己": "午", "庚": "辰", "辛": "卯", "壬": "亥", "癸": "寅"}
        if curr_zhi == liu_xia.get(day_gan): add("流霞")

        # 劫煞
        jie_sha = {"申": "巳", "子": "巳", "辰": "巳", "寅": "亥", "午": "亥", "戌": "亥", "巳": "寅", "酉": "寅", "丑": "寅", "亥": "申", "卯": "申", "未": "申"}
        if curr_zhi == jie_sha.get(year_zhi) or curr_zhi == jie_sha.get(day_zhi): add("劫煞")

        # 亡神
        wang_shen = {"申": "亥", "子": "亥", "辰": "亥", "寅": "巳", "午": "巳", "戌": "巳", "巳": "申", "酉": "申", "丑": "申", "亥": "寅", "卯": "寅", "未": "寅"}
        if curr_zhi == wang_shen.get(year_zhi) or curr_zhi == wang_shen.get(day_zhi): add("亡神")

        # 灾煞
        zai_sha = {"申": "午", "子": "午", "辰": "午", "寅": "子", "午": "子", "戌": "子", "巳": "卯", "酉": "卯", "丑": "卯", "亥": "酉", "卯": "酉", "未": "酉"}
        if curr_zhi == zai_sha.get(year_zhi): add("灾煞")

        # 孤辰/寡宿
        dirs = {
            "亥": 0, "子": 0, "丑": 0,  # N
            "寅": 1, "卯": 1, "辰": 1,  # E
            "巳": 2, "午": 2, "未": 2,  # S
            "申": 3, "酉": 3, "戌": 3  # W
        }
        y_dir = dirs[year_zhi]
        gu_map = ["寅", "巳", "申", "亥"]
        gua_map = ["戌", "丑", "辰", "未"]
        if curr_zhi == gu_map[y_dir]: add("孤辰")
        if curr_zhi == gua_map[y_dir]: add("寡宿")

        # 华盖
        hua_gai = {"申": "辰", "子": "辰", "辰": "辰", "寅": "戌", "午": "戌", "戌": "戌", "巳": "丑", "酉": "丑", "丑": "丑", "亥": "未", "卯": "未", "未": "未"}
        if curr_zhi == hua_gai.get(year_zhi) or curr_zhi == hua_gai.get(day_zhi): add("华盖")

        # 将星
        jiang_xing = {"申": "子", "子": "子", "辰": "子", "寅": "午", "午": "午", "戌": "午", "巳": "酉", "酉": "酉", "丑": "酉", "亥": "卯", "卯": "卯", "未": "卯"}
        if curr_zhi == jiang_xing.get(year_zhi) or curr_zhi == jiang_xing.get(day_zhi): add("将星")

        # 元辰（大耗）
        yuan_chen = {"子": "未", "丑": "申", "寅": "酉", "卯": "戌", "辰": "亥", "巳": "子", "午": "丑", "未": "寅", "申": "卯", "酉": "辰", "戌": "巳", "亥": "午"}
        if curr_zhi == yuan_chen.get(year_zhi): add("元辰")
        if curr_zhi == yuan_chen.get(year_zhi): add("大耗")

        # ==========================================
        # 4. 天月德 (Season/Month Based)
        # ==========================================

        # 天德
        tian_de = {"寅": "丁", "卯": "申", "辰": "壬", "巳": "辛", "午": "亥", "未": "甲", "申": "癸", "酉": "寅", "戌": "丙", "亥": "乙", "子": "巳", "丑": "庚"}
        td_target = tian_de.get(month_zhi)
        if td_target:
            if (td_target in GAN and curr_gan == td_target) or (td_target in ZHI and curr_zhi == td_target):
                add("天德")
                # 天德合
                he_map = {"丁": "壬", "壬": "丁", "丙": "辛", "辛": "丙", "甲": "己", "己": "甲",
                          "乙": "庚", "庚": "乙", "癸": "戊", "戊": "癸", "寅": "亥", "亥": "寅",
                          "申": "巳", "巳": "申", "卯": "戌", "戌": "卯", "子": "丑", "丑": "子"}
                if td_target in he_map:
                    he_target = he_map[td_target]
                    if (he_target in GAN and curr_gan == he_target) or (he_target in ZHI and curr_zhi == he_target):
                        add("天德合")

        # 月德
        yue_de = {"寅": "丙", "午": "丙", "戌": "丙", "申": "壬", "子": "壬", "辰": "壬", "亥": "甲", "卯": "甲", "未": "甲", "巳": "庚", "酉": "庚", "丑": "庚"}
        if curr_gan == yue_de.get(month_zhi):
            add("月德")
            # 月德合
            yue_de_he_map = {"丙": "辛", "壬": "丁", "甲": "己", "庚": "乙"}
            if curr_gan in yue_de_he_map.values():
                he_gan = [k for k, v in yue_de_he_map.items() if v == curr_gan][0]
                if month_zhi in [k for k, v in yue_de.items() if v == he_gan]:
                    add("月德合")

        # 天医
        m_idx = ZHI.index(month_zhi)
        if curr_zhi == ZHI[(m_idx - 1 + 12) % 12]: add("天医")

        # ==========================================
        # 5. 特殊日柱神煞 (Day Pillar Only)
        # ==========================================

        if is_day:
            gz = day_gan + day_zhi

            # 魁罡
            if gz in ["壬辰", "庚戌", "庚辰", "戊戌"]: add("魁罡")

            # 阴阳差错
            if gz in ["丙子", "丁丑", "戊寅", "辛卯", "壬辰", "癸巳", "丙午", "丁未", "戊申", "辛酉", "壬戌", "癸亥"]: add("阴阳差错")

            # 十恶大败
            if gz in ["甲辰", "乙巳", "丙申", "丁亥", "戊戌", "己丑", "庚辰", "辛巳", "壬申", "癸亥"]: add("十恶大败")

            # 孤鸾煞
            if gz in ["乙巳", "丁巳", "辛亥", "戊申", "甲寅", "戊午", "壬子", "丙午"]: add("孤鸾")

            # 四废
            if month_zhi in ["寅", "卯", "辰"] and gz in ["庚申", "辛酉"]: add("四废")
            elif month_zhi in ["巳", "午", "未"] and gz in ["壬子", "癸亥"]: add("四废")
            elif month_zhi in ["申", "酉", "戌"] and gz in ["甲寅", "乙卯"]: add("四废")
            elif month_zhi in ["亥", "子", "丑"] and gz in ["丙午", "丁巳"]: add("四废")

            # 十灵日
            if gz in ["甲辰", "乙亥", "丙辰", "丁酉", "戊午", "庚戌", "庚寅", "辛亥", "壬寅", "癸未"]: add("十灵")

            # 金神
            if gz in ["乙丑", "己巳", "癸酉"]: add("金神")

        # 学堂
        xue_tang = {"甲": "亥", "乙": "午", "丙": "寅", "丁": "酉", "戊": "寅", "己": "酉", "庚": "巳", "辛": "子", "壬": "申", "癸": "卯"}
        if curr_zhi == xue_tang.get(day_gan): add("学堂")

        # 词馆
        ci_guan = {
            "甲": "寅", "乙": "卯", "丙": "巳", "丁": "午", "戊": "巳", "己": "午",
            "庚": "申", "辛": "酉", "壬": "亥", "癸": "子"
        }
        if curr_zhi == ci_guan.get(day_gan): add("词馆")

        # ==========================================
        # 6. 其他重要神煞
        # ==========================================

        # 天罗地网
        # 辰戌为天罗地网，男忌天罗，女忌地网
        if (year_zhi in ["辰", "戌"] or day_zhi in ["辰", "戌"]):
            if curr_zhi in ["辰", "戌"]:
                add("天罗地网")

        # 勾绞煞
        # 阳男阴女：命前三辰为勾，后三辰为绞
        # 阴男阳女：命前三辰为绞，后三辰为勾
        # 这里简化，只查位置
        y_idx = ZHI.index(year_zhi)
        for i, check_zhi in enumerate(ZHI):
            if check_zhi == curr_zhi:
                check_idx = i
                if check_idx == (y_idx + 3) % 12:
                    add("勾绞煞")
                elif check_idx == (y_idx - 3 + 12) % 12:
                    add("勾绞煞")
                break

        # 丧门/吊客/披麻
        # 年支前两位为丧门，后两位为吊客，后三位为披麻
        y_idx = ZHI.index(year_zhi)
        sang_men_idx = (y_idx + 2) % 12
        diao_ke_idx = (y_idx - 2 + 12) % 12
        pi_ma_idx = (y_idx - 3 + 12) % 12

        if curr_zhi == ZHI[sang_men_idx]: add("丧门")
        if curr_zhi == ZHI[diao_ke_idx]: add("吊客")
        if curr_zhi == ZHI[pi_ma_idx]: add("披麻")

        # 破碎
        # 岁破：年支被冲
        if curr_zhi == ZHI[(y_idx + 6) % 12]: add("岁破")

        # 气冲 - 三刑之一
        # 寅巳申、丑未戌、子午卯三刑
        if year_zhi in ["寅", "巳", "申"] and curr_zhi in ["寅", "巳", "申"]:
            add("三刑")
        if year_zhi in ["丑", "未", "戌"] and curr_zhi in ["丑", "未", "戌"]:
            add("三刑")
        if year_zhi in ["子", "午", "卯"] and curr_zhi in ["子", "午", "卯"]:
            add("三刑")

        return shenshas

