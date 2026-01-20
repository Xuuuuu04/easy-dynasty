from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import SessionLocal
import functools

class SettingsService:
    @staticmethod
    @functools.lru_cache(maxsize=1)
    def get_all_settings():
        """Fetch all settings and cache them briefly"""
        db = SessionLocal()
        try:
            result = db.execute(text("SELECT `key`, `value` FROM system_settings")).fetchall()
            return {row[0]: row[1] for row in result}
        finally:
            db.close()

    @staticmethod
    def get_setting(key: str, default: str = ""):
        # For production, you'd want a more sophisticated cache invalidation
        # For now, we fetch fresh to ensure admin changes reflect immediately
        db = SessionLocal()
        try:
            result = db.execute(
                text("SELECT `value` FROM system_settings WHERE `key` = :key"),
                {"key": key}
            ).fetchone()
            return result[0] if result else default
        finally:
            db.close()

settings_service = SettingsService()
