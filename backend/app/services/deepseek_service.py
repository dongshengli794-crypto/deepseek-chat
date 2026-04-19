"""
DeepSeek API 服务封装
"""
from typing import List, Dict, Generator
from openai import OpenAI

from app.config import settings


class DeepSeekService:
    """DeepSeek API 服务"""
    
    def __init__(self):
        self.client = OpenAI(
            api_key=settings.DEEPSEEK_API_KEY,
            base_url=settings.DEEPSEEK_BASE_URL
        )
        self.model = settings.DEEPSEEK_MODEL
    
    def chat_stream(
        self, 
        messages: List[Dict[str, str]], 
        thinking_enabled: bool = True
    ) -> Generator[Dict, None, None]:
        """
        流式聊天（同步 generator）
        
        Args:
            messages: 消息列表，格式 [{"role": "user", "content": "..."}]
            thinking_enabled: 是否启用思考模式
        
        Yields:
            {"type": "reasoning" | "content" | "done" | "error", "content": str, "done": bool}
        """
        try:
            # 构建请求参数
            params = {
                "model": self.model,
                "messages": messages,
                "stream": True
            }
            
            # 如果启用思考模式，添加 thinking 参数
            if thinking_enabled:
                params["extra_body"] = {"thinking": {"type": "enabled"}}
            
            # 调用 API
            response = self.client.chat.completions.create(**params)
            
            reasoning_content = ""
            content = ""
            
            for chunk in response:
                delta = chunk.choices[0].delta
                
                # 处理思考过程
                if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
                    reasoning_content += delta.reasoning_content
                    yield {
                        "type": "reasoning",
                        "content": delta.reasoning_content,
                        "done": False
                    }
                
                # 处理回复内容
                if hasattr(delta, 'content') and delta.content:
                    content += delta.content
                    yield {
                        "type": "content",
                        "content": delta.content,
                        "done": False
                    }
                
                # 检查是否结束
                if chunk.choices[0].finish_reason == "stop":
                    yield {
                        "type": "done",
                        "content": "",
                        "done": True,
                        "full_reasoning": reasoning_content,
                        "full_content": content
                    }
                    break
                    
        except Exception as e:
            yield {
                "type": "error",
                "content": str(e),
                "done": True
            }


# 创建全局服务实例
deepseek_service = DeepSeekService()
