import os

from app.core.config import settings


class SettingsService:
    """
    简化的设置服务，从环境变量和配置对象读取设置
    """

    @staticmethod
    def get(key: str, default: str = None) -> str:
        """从 settings 对象或环境变量读取配置"""
        # 1. 尝试从 settings 对象读取
        if hasattr(settings, key):
            value = getattr(settings, key)
            if value:
                return value

        # 2. 回退到环境变量
        value = os.getenv(key)
        if value:
            return value

        # 3. 使用默认值
        return default
