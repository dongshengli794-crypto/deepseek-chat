"""
DeepSeek API 测试脚本
测试流式输出和思考模式，记录接口返回的详细字段
"""

from openai import OpenAI
import json

# DeepSeek API 配置
API_KEY = "sk-bf40846bfb084e85b57d3d6bc72361fe"
BASE_URL = "https://api.deepseek.com"

client = OpenAI(api_key=API_KEY, base_url=BASE_URL)


def test_stream_with_reasoning():
    """
    测试1: 使用 deepseek-reasoner 模型的流式输出
    """
    print("=" * 60)
    print("测试1: deepseek-reasoner 流式输出")
    print("=" * 60)
    
    messages = [{"role": "user", "content": "9.11 and 9.8, which is greater?"}]
    
    response = client.chat.completions.create(
        model="deepseek-reasoner",
        messages=messages,
        stream=True
    )
    
    reasoning_content = ""
    content = ""
    chunk_count = 0
    first_chunk = None
    last_chunk = None
    
    print("\n--- 流式输出过程 ---")
    for chunk in response:
        chunk_count += 1
        
        # 记录第一个和最后一个 chunk
        if chunk_count == 1:
            first_chunk = chunk
            print(f"\n[第1个chunk结构]:")
            print(f"  chunk.id: {chunk.id}")
            print(f"  chunk.model: {chunk.model}")
            print(f"  chunk.object: {chunk.object}")
            print(f"  chunk.created: {chunk.created}")
            print(f"  chunk.choices[0].index: {chunk.choices[0].index}")
            print(f"  chunk.choices[0].delta: {chunk.choices[0].delta}")
            print(f"  chunk.choices[0].finish_reason: {chunk.choices[0].finish_reason}")
        
        last_chunk = chunk
        
        # 处理 reasoning_content
        delta = chunk.choices[0].delta
        if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
            reasoning_content += delta.reasoning_content
            print(f"[reasoning] {delta.reasoning_content}", end="", flush=True)
        
        # 处理 content
        if hasattr(delta, 'content') and delta.content:
            content += delta.content
            print(f"[content] {delta.content}", end="", flush=True)
    
    print(f"\n\n[最后一个chunk]:")
    print(f"  finish_reason: {last_chunk.choices[0].finish_reason}")
    
    print(f"\n--- 统计信息 ---")
    print(f"总chunk数: {chunk_count}")
    print(f"reasoning_content 长度: {len(reasoning_content)}")
    print(f"content 长度: {len(content)}")
    
    print(f"\n--- 完整 reasoning_content ---")
    print(reasoning_content[:500] + "..." if len(reasoning_content) > 500 else reasoning_content)
    
    print(f"\n--- 完整 content ---")
    print(content)
    
    return content


def test_stream_chat_with_thinking():
    """
    测试2: 使用 deepseek-chat 模型 + thinking 参数开启思考模式
    """
    print("\n" + "=" * 60)
    print("测试2: deepseek-chat + thinking 参数 流式输出")
    print("=" * 60)
    
    messages = [{"role": "user", "content": "计算 15 * 23 等于多少？"}]
    
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=messages,
        stream=True,
        extra_body={"thinking": {"type": "enabled"}}
    )
    
    reasoning_content = ""
    content = ""
    chunk_count = 0
    
    print("\n--- 流式输出过程 ---")
    for chunk in response:
        chunk_count += 1
        
        if chunk_count == 1:
            print(f"\n[第1个chunk结构]:")
            print(f"  chunk.id: {chunk.id}")
            print(f"  chunk.model: {chunk.model}")
            print(f"  chunk.choices[0].delta 属性: {dir(chunk.choices[0].delta)}")
        
        delta = chunk.choices[0].delta
        
        # 处理 reasoning_content
        if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
            reasoning_content += delta.reasoning_content
            print(f"[thinking] {delta.reasoning_content}", end="", flush=True)
        
        # 处理 content
        if hasattr(delta, 'content') and delta.content:
            content += delta.content
            print(f"[content] {delta.content}", end="", flush=True)
    
    print(f"\n\n--- 统计信息 ---")
    print(f"总chunk数: {chunk_count}")
    print(f"reasoning_content 长度: {len(reasoning_content)}")
    print(f"content 长度: {len(content)}")
    
    print(f"\n--- 完整 reasoning_content ---")
    print(reasoning_content[:500] + "..." if len(reasoning_content) > 500 else reasoning_content)
    
    print(f"\n--- 完整 content ---")
    print(content)


def test_stream_chat_without_thinking():
    """
    测试3: 使用 deepseek-chat 模型，不开启思考模式（普通对话）
    """
    print("\n" + "=" * 60)
    print("测试3: deepseek-chat 普通对话模式（无思考）")
    print("=" * 60)
    
    messages = [{"role": "user", "content": "你好，请简单介绍一下你自己"}]
    
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=messages,
        stream=True
    )
    
    content = ""
    chunk_count = 0
    has_reasoning = False
    
    print("\n--- 流式输出过程 ---")
    for chunk in response:
        chunk_count += 1
        
        if chunk_count == 1:
            print(f"\n[第1个chunk结构]:")
            print(f"  chunk.id: {chunk.id}")
            print(f"  chunk.model: {chunk.model}")
        
        delta = chunk.choices[0].delta
        
        # 检查是否有 reasoning_content
        if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
            has_reasoning = True
            print(f"[reasoning] {delta.reasoning_content}", end="", flush=True)
        
        # 处理 content
        if hasattr(delta, 'content') and delta.content:
            content += delta.content
            print(f"{delta.content}", end="", flush=True)
    
    print(f"\n\n--- 统计信息 ---")
    print(f"总chunk数: {chunk_count}")
    print(f"是否有reasoning_content: {has_reasoning}")
    print(f"content 长度: {len(content)}")


def test_multi_turn_conversation():
    """
    测试4: 多轮对话测试
    """
    print("\n" + "=" * 60)
    print("测试4: 多轮对话")
    print("=" * 60)
    
    messages = [{"role": "user", "content": "我叫小明"}]
    
    # 第一轮
    print("\n[第一轮] 用户: 我叫小明")
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=messages,
        stream=True
    )
    
    content1 = ""
    for chunk in response:
        delta = chunk.choices[0].delta
        if hasattr(delta, 'content') and delta.content:
            content1 += delta.content
    
    print(f"[第一轮] AI: {content1}")
    
    # 第二轮
    messages.append({"role": "assistant", "content": content1})
    messages.append({"role": "user", "content": "我叫什么名字？"})
    
    print(f"\n[第二轮] 用户: 我叫什么名字？")
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=messages,
        stream=True
    )
    
    content2 = ""
    for chunk in response:
        delta = chunk.choices[0].delta
        if hasattr(delta, 'content') and delta.content:
            content2 += delta.content
    
    print(f"[第二轮] AI: {content2}")
    
    print(f"\n--- 消息历史结构 ---")
    for i, msg in enumerate(messages):
        print(f"  [{i}] role: {msg['role']}, content: {msg['content'][:50]}...")


def print_summary():
    """
    打印接口规范总结
    """
    print("\n" + "=" * 60)
    print("接口规范总结")
    print("=" * 60)
    
    summary = """
## DeepSeek API 接口规范

### 1. 基础配置
- BASE_URL: https://api.deepseek.com
- 兼容 OpenAI SDK

### 2. 模型选择
- deepseek-chat: 通用对话模型
- deepseek-reasoner: 推理模型（自带思考）

### 3. 开启思考模式的两种方式
方式1: model="deepseek-reasoner"
方式2: model="deepseek-chat" + extra_body={"thinking": {"type": "enabled"}}

### 4. 流式响应 Chunk 结构
```
chunk.id: str                    # 请求ID
chunk.model: str                 # 模型名称
chunk.object: str                # "chat.completion.chunk"
chunk.created: int               # 时间戳
chunk.choices[0].index: int      # 选项索引
chunk.choices[0].delta:          # 增量内容
    - reasoning_content: str     # 思考过程（仅思考模式）
    - content: str               # 回复内容
chunk.choices[0].finish_reason:  # 结束原因（最后一个chunk才有）
    - None: 未结束
    - "stop": 正常结束
```

### 5. 前端对接要点
- 流式输出时先输出 reasoning_content，再输出 content
- reasoning_content 可能为空（普通对话模式）
- 需要累积 chunk 内容拼接完整响应
- 多轮对话需要维护 messages 数组
"""
    print(summary)


if __name__ == "__main__":
    print("DeepSeek API 测试开始")
    print("=" * 60)
    
    try:
        # 测试1: deepseek-reasoner 流式输出
        test_stream_with_reasoning()
        
        # 测试2: deepseek-chat + thinking 参数
        test_stream_chat_with_thinking()
        
        # 测试3: deepseek-chat 普通对话
        test_stream_chat_without_thinking()
        
        # 测试4: 多轮对话
        test_multi_turn_conversation()
        
        # 打印总结
        print_summary()
        
    except Exception as e:
        print(f"\n错误: {e}")
        import traceback
        traceback.print_exc()
