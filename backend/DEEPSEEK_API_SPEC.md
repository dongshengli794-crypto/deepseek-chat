# DeepSeek API 接口规范文档

> 测试时间: 2024-04-18
> 测试脚本: test_deepseek_api.py

## 1. 基础配置

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-xxx",
    base_url="https://api.deepseek.com"
)
```

## 2. 模型选择

| 模型 | 用途 | 思考过程 |
|------|------|----------|
| `deepseek-chat` | 通用对话 | 默认无，可通过参数开启 |
| `deepseek-reasoner` | 推理模式 | 自动开启 |

## 3. 开启思考模式的两种方式

### 方式1: 使用 deepseek-reasoner 模型
```python
response = client.chat.completions.create(
    model="deepseek-reasoner",
    messages=messages,
    stream=True
)
```

### 方式2: 使用 deepseek-chat + thinking 参数
```python
response = client.chat.completions.create(
    model="deepseek-chat",
    messages=messages,
    stream=True,
    extra_body={"thinking": {"type": "enabled"}}
)
```

**注意**: 方式2 实际返回的 `chunk.model` 仍为 `deepseek-reasoner`

## 4. 流式响应 Chunk 结构

### 4.1 Chunk 对象属性

```python
chunk.id: str                    # 请求ID，如 "2031f829-34d3-4ddb-ba5f-873df86a3c53"
chunk.model: str                 # 模型名称，如 "deepseek-reasoner" 或 "deepseek-chat"
chunk.object: str                # 固定值 "chat.completion.chunk"
chunk.created: int               # Unix时间戳

chunk.choices[0].index: int      # 选项索引，通常为 0
chunk.choices[0].delta:          # 增量内容对象
chunk.choices[0].finish_reason:  # 结束原因
```

### 4.2 Delta 对象属性

```python
delta.role: str                  # 仅第一个chunk有，值为 "assistant"
delta.reasoning_content: str     # 思考过程内容（仅思考模式有）
delta.content: str               # 回复内容
delta.function_call: None        # 函数调用（未使用）
delta.tool_calls: None           # 工具调用（未使用）
delta.refusal: None              # 拒绝原因（未使用）
```

### 4.3 finish_reason 值

| 值 | 含义 |
|------|------|
| `None` | 流式输出未结束 |
| `"stop"` | 正常结束 |

## 5. 流式输出顺序

```
┌─────────────────────────────────────────────────────────┐
│                     思考模式流程                         │
├─────────────────────────────────────────────────────────┤
│  1. 第一个chunk: delta.role = "assistant"               │
│  2. 多个chunk: delta.reasoning_content = "思考内容..."   │
│  3. 多个chunk: delta.content = "回复内容..."            │
│  4. 最后chunk: finish_reason = "stop"                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                     普通对话流程                         │
├─────────────────────────────────────────────────────────┤
│  1. 第一个chunk: delta.role = "assistant"               │
│  2. 多个chunk: delta.content = "回复内容..."            │
│  3. 最后chunk: finish_reason = "stop"                   │
└─────────────────────────────────────────────────────────┘
```

## 6. 测试结果数据

### 6.1 deepseek-reasoner 测试
- 问题: "9.11 and 9.8, which is greater?"
- 总chunk数: **284**
- reasoning_content 长度: **746** 字符
- content 长度: **122** 字符

### 6.2 deepseek-chat + thinking 测试
- 问题: "计算 15 * 23 等于多少？"
- 总chunk数: **129**
- reasoning_content 长度: **225** 字符
- content 长度: **14** 字符

### 6.3 deepseek-chat 普通对话测试
- 问题: "你好，请简单介绍一下你自己"
- 总chunk数: **242**
- 是否有reasoning_content: **否**
- content 长度: **439** 字符

## 7. 多轮对话 Messages 格式

```python
messages = [
    {"role": "user", "content": "我叫小明"},
    {"role": "assistant", "content": "你好，小明！..."},
    {"role": "user", "content": "我叫什么名字？"},
    # AI会记住上下文，回答 "小明"
]
```

## 8. 后端 SSE 响应格式设计

基于测试结果，建议后端 SSE 响应格式：

```
data: {"type": "reasoning", "content": "让我思考...", "done": false}
data: {"type": "reasoning", "content": "首先需要...", "done": false}
data: {"type": "content", "content": "答案是", "done": false}
data: {"type": "content", "content": "345", "done": false}
data: {"type": "done", "content": "", "done": true}
```

## 9. 前端对接要点

1. **区分两种内容**: 通过 `delta.reasoning_content` 和 `delta.content` 区分思考过程和回复内容
2. **累积拼接**: 需要累积所有 chunk 的内容拼接完整响应
3. **判断结束**: 通过 `finish_reason === "stop"` 判断流式输出结束
4. **多轮对话**: 需要在前端维护完整的 messages 数组
5. **空值处理**: `reasoning_content` 和 `content` 可能为 `None` 或空字符串

## 10. 示例代码：处理流式响应

```python
reasoning_content = ""
content = ""

for chunk in response:
    delta = chunk.choices[0].delta
    
    # 处理思考过程
    if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
        reasoning_content += delta.reasoning_content
        # 发送 SSE: type=reasoning
    
    # 处理回复内容
    if hasattr(delta, 'content') and delta.content:
        content += delta.content
        # 发送 SSE: type=content
    
    # 检查是否结束
    if chunk.choices[0].finish_reason == "stop":
        # 发送 SSE: type=done
        break
```
