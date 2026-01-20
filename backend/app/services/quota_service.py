from datetime import date
from sqlalchemy import text
from fastapi import HTTPException, status

class QuotaService:
    @staticmethod
    def check_quota(db, user_id: int, feature: str):
        """
        Check if user has reached their daily quota.
        feature: 'tarot' or 'bazi'
        """
        # 1. Reset quota if it's a new day
        db.execute(
            text("UPDATE users SET tarot_used_today = 0, bazi_used_today = 0, last_usage_reset = :today WHERE last_usage_reset < :today"),
            {"today": date.today()}
        )
        db.commit()

        # 2. Get user tier and usage
        user = db.execute(
            text("SELECT tier, tarot_used_today, bazi_used_today FROM users WHERE id = :id"),
            {"id": user_id}
        ).fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        tier, tarot_used, bazi_used = user
        
        # Define limits
        LIMITS = {
            'free': {'tarot': 1, 'bazi': 5},
            'vip': {'tarot': 20, 'bazi': 100},
            'svip': {'tarot': 80, 'bazi': 300}
        }

        current_usage = tarot_used if feature == 'tarot' else bazi_used
        limit = LIMITS.get(tier, LIMITS['free'])[feature]

        if current_usage >= limit:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"今日{feature}使用次数已达上限 ({limit}次)。请升级会员获取更多次数。"
            )

        return True

    @staticmethod
    def increment_usage(db, user_id: int, feature: str):
        column = "tarot_used_today" if feature == 'tarot' else "bazi_used_today"
        db.execute(
            text(f"UPDATE users SET {column} = {column} + 1 WHERE id = :id"),
            {"id": user_id}
        )
        db.commit()
