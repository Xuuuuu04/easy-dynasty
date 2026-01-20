import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "EasyDynasty API"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DB_USER: str = "root"
    DB_PASSWORD: str = "xsy19507"
    DB_HOST: str = "localhost"
    DB_PORT: str = "3306"
    DB_NAME: str = "easydynasty"
    
    # External APIs
    AMAP_API_KEY: str = ""
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
