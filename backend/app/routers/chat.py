"""
聊天路由 - SSE 流式输出
"""
import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Conversation, Message
from app.schemas.schemas import ChatRequest
from app.services.deepseek_service import deepseek_service

router = APIRouter(prefix="/api", tags=["聊天"])


@router.post("/chat")
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    聊天接口 - SSE 流式输出
    
    请求体:
        conversation_id: 会话ID
        message: 用户消息
        thinking_enabled: 是否启用思考模式（可选，覆盖会话设置）
    
    响应: SSE 流式输出
        data: {"type": "reasoning" | "content" | "done" | "error", "content": "...", "done": bool}
    """
    # 获取会话
    conversation = db.query(Conversation).filter(
        Conversation.id == request.conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    # 确定是否启用思考模式
    thinking_enabled = request.thinking_enabled
    if thinking_enabled is None:
        thinking_enabled = conversation.thinking_enabled
    
    # 保存用户消息
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.message
    )
    db.add(user_message)
    db.commit()
    
    # 更新会话时间和标题
    if conversation.title == "新对话":
        conversation.title = request.message[:20] + ("..." if len(request.message) > 20 else "")
    db.commit()
    
    # 构建消息历史
    messages = []
    for msg in conversation.messages:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })
    
    def generate():
        """生成 SSE 流"""
        full_reasoning = ""
        full_content = ""
        
        for chunk in deepseek_service.chat_stream(messages, thinking_enabled):
            # 记录完整内容
            if chunk["type"] == "reasoning":
                full_reasoning += chunk["content"]
            elif chunk["type"] == "content":
                full_content += chunk["content"]
            elif chunk["type"] == "done":
                full_reasoning = chunk.get("full_reasoning", full_reasoning)
                full_content = chunk.get("full_content", full_content)
                
                # 保存 AI 消息到数据库
                ai_message = Message(
                    conversation_id=conversation.id,
                    role="assistant",
                    content=full_content,
                    reasoning_content=full_reasoning if full_reasoning else None
                )
                db.add(ai_message)
                db.commit()
            
            # 发送 SSE 数据
            yield f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
