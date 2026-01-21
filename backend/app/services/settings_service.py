from app.db.session import SessionLocal
from sqlalchemy import text
import os

class SettingsService:
    _cache = {}

    @staticmethod
    def get(key: str, default: str = None) -> str:
        # 1. 尝试从数据库读取
        db = SessionLocal()
        try:
            row = db.execute(text("SELECT value FROM system_settings WHERE `key` = :k"), {"k": key}).fetchone()
            if row:
                return row[0]
        except Exception as e:
            print(f"DB Settings Error: {e}")
        finally:
            db.close()
        
        # 2. 回退到环境变量或默认值
        return os.getenv(key, default)

    @staticmethod
    def set(key: str, value: str):
        db = SessionLocal()
        try:
            db.execute(text("UPDATE system_settings SET value = :v WHERE `key` = :k"), {"k": key, "v": value})
            db.commit()
        finally:
            db.close()