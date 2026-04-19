from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers import health, conversation, chat

# 创建数据库表
Base.metadata.create_all(bind=engine)

# 创建 FastAPI 应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="个人 DeepSeek 对话问答系统 API"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(health.router)
app.include_router(conversation.router)
app.include_router(chat.router)


@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "Welcome to DeepSeek Chat API",
        "docs": "/docs",
        "health": "/api/health"
    }
