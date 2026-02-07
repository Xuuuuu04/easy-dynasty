from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "EasyDynasty API"
    API_V1_STR: str = "/api/v1"
    REDIS_URL: str = "redis://localhost:6379"
    CORS_ORIGINS: str = "*"
    SECRET_KEY: str = ""

    # External APIs
    AMAP_API_KEY: str = ""

    # LLM Configuration
    DEFAULT_LLM_API_KEY: str = ""
    DEFAULT_LLM_BASE_URL: str = "https://api.siliconflow.cn/v1"
    DEFAULT_LLM_MODEL: str = "Qwen/Qwen3-Next-80B-A3B-Instruct"
    LLM_BASE_URL: str = "https://api.siliconflow.cn/v1"
    TAROT_MODEL: str = "Qwen/Qwen3-Next-80B-A3B-Instruct"

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="ignore",
    )


settings = Settings()
