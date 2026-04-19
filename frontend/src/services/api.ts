import type { HealthResponse, Conversation, Message } from '../types';

const API_BASE = '/api';

/**
 * 带重试的 fetch 包装器
 * @param url 请求 URL
 * @param options fetch 选项
 * @param retries 最大重试次数
 * @param delay 重试延迟 (毫秒)
 */
async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retries = 3,
  delay = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      // 对于 5xx 错误，尝试重试
      if (response.status >= 500 && i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      
      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      // 网络错误时重试
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
    }
  }
  
  throw lastError || new Error('请求失败');
}

/**
 * 健康检查接口
 */
export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetchWithRetry(`${API_BASE}/health`, undefined, 1, 500);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }
  return response.json();
}

// ========== 会话管理 API ==========

/**
 * 获取所有会话列表
 */
export async function getConversations(): Promise<Conversation[]> {
  const response = await fetchWithRetry(`${API_BASE}/conversations`);
  if (!response.ok) {
    throw new Error(`获取会话列表失败: ${response.status}`);
  }
  return response.json();
}

/**
 * 创建新会话
 */
export async function createConversation(
  title: string = '新对话',
  thinkingEnabled: boolean = true
): Promise<Conversation> {
  const response = await fetchWithRetry(`${API_BASE}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, thinking_enabled: thinkingEnabled }),
  });
  if (!response.ok) {
    throw new Error(`创建会话失败: ${response.status}`);
  }
  return response.json();
}

/**
 * 获取会话详情（包含消息）
 */
export async function getConversationDetail(id: number): Promise<{
  id: number;
  title: string;
  thinking_enabled: boolean;
  messages: Message[];
}> {
  const response = await fetchWithRetry(`${API_BASE}/conversations/${id}`);
  if (!response.ok) {
    throw new Error(`获取会话详情失败: ${response.status}`);
  }
  return response.json();
}

/**
 * 更新会话
 */
export async function updateConversation(
  id: number,
  data: { title?: string; thinking_enabled?: boolean }
): Promise<Conversation> {
  const response = await fetchWithRetry(`${API_BASE}/conversations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`更新会话失败: ${response.status}`);
  }
  return response.json();
}

/**
 * 删除会话
 */
export async function deleteConversation(id: number): Promise<void> {
  const response = await fetchWithRetry(`${API_BASE}/conversations/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`删除会话失败: ${response.status}`);
  }
}

// ========== 聊天 API (SSE) ==========

export interface StreamChunk {
  type: 'reasoning' | 'content' | 'done' | 'error';
  content: string;
  done: boolean;
}

/**
 * 发送聊天消息 (SSE 流式)
 * @param conversationId 会话ID
 * @param message 消息内容
 * @param thinkingEnabled 是否启用思考模式
 * @param signal AbortSignal 用于取消请求
 */
export async function* sendChatMessage(
  conversationId: number,
  message: string,
  thinkingEnabled?: boolean,
  signal?: AbortSignal
): AsyncGenerator<StreamChunk> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversation_id: conversationId,
      message,
      thinking_enabled: thinkingEnabled,
    }),
    signal,
  });

  if (!response.ok) {
    yield {
      type: 'error',
      content: `请求失败: ${response.status}`,
      done: true,
    };
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    yield {
      type: 'error',
      content: '无法读取响应流',
      done: true,
    };
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      // 检查是否已取消
      if (signal?.aborted) {
        yield {
          type: 'done',
          content: '',
          done: true,
        };
        return;
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // 解析 SSE 数据
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const chunk: StreamChunk = JSON.parse(data);
            yield chunk;
            if (chunk.done) return;
          } catch {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
