// 健康检查响应
export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  service: string;
}

// 会话
export interface Conversation {
  id: number;
  title: string;
  thinking_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// 消息
export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  reasoning_content?: string;
  created_at: string;
}

// 流式响应块
export interface StreamChunk {
  type: 'reasoning' | 'content' | 'done' | 'error';
  content: string;
  done: boolean;
}

// 聊天状态
export interface ChatState {
  conversations: Conversation[];
  currentConversationId: number | null;
  messages: Message[];
  thinkingEnabled: boolean;
  isStreaming: boolean;
  streamingReasoning: string;
  streamingContent: string;
}
