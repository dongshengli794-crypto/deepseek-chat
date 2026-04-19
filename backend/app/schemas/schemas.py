from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


# ========== 会话相关 ==========

class ConversationCreate(BaseModel):
    """创建会话请求"""
    title: Optional[str] = "新对话"
    thinking_enabled: Optional[bool] = True


class ConversationUpdate(BaseModel):
    """更新会话请求"""
    title: Optional[str] = None
    thinking_enabled: Optional[bool] = None


class MessageResponse(BaseModel):
    """消息响应"""
    id: int
    conversation_id: int
    role: str
    content: str
    reasoning_content: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    """会话响应"""
    id: int
    title: str
    thinking_enabled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationDetailResponse(ConversationResponse):
    """会话详情响应（包含消息）"""
    messages: List[MessageResponse] = []


# ========== 聊天相关 ==========

class ChatRequest(BaseModel):
    """聊天请求"""
    conversation_id: int
    message: str
    thinking_enabled: Optional[bool] = None  # 可选，覆盖会话设置


class ChatStreamChunk(BaseModel):
    """流式响应块"""
    type: str  # "reasoning" / "content" / "done" / "error"
    content: str
    done: bool
