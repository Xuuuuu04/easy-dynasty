
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "EasyDynasty API"
    API_V1_STR: str = "/api/v1"

    # External APIs
    AMAP_API_KEY: str = ""

    # LLM Configuration
    DEFAULT_LLM_API_KEY: str = ""
    DEFAULT_LLM_BASE_URL: str = "https://api.siliconflow.cn/v1"
    DEFAULT_LLM_MODEL: str = "Qwen/Qwen3-Next-80B-A3B-Instruct"
    TAROT_MODEL: str = "Qwen/Qwen3-Next-80B-A3B-Instruct"

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"  # 忽略额外的环境变量


settings = Settings()
