import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()


class Settings:
    """应用配置"""
    
    # 应用信息
    APP_NAME: str = "DeepSeek Chat API"
    APP_VERSION: str = "1.0.0"
    
    # DeepSeek API 配置
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    DEEPSEEK_BASE_URL: str = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
    DEEPSEEK_MODEL: str = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
    
    # 数据库配置
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./chat.db")
    
    # CORS 配置
    CORS_ORIGINS: list = ["http://localhost:5173", "http://127.0.0.1:5173"]


settings = Settings()
