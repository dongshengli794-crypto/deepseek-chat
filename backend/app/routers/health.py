from datetime import datetime
from fastapi import APIRouter

from app.config import settings

router = APIRouter(prefix="/api", tags=["健康检查"])


@router.get("/health")
async def health_check():
    """
    健康检查接口
    返回服务状态、时间戳和版本信息
    """
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": settings.APP_VERSION,
        "service": settings.APP_NAME
    }
