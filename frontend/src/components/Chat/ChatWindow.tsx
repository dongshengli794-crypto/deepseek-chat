import type { Message } from '../../types';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { ThinkingSwitcher } from './ThinkingSwitcher';

interface ChatWindowProps {
  messages: Message[];
  thinkingEnabled: boolean;
  conversationTitle?: string;
  isStreaming?: boolean;
  isLoadingMessages?: boolean;
  isSending?: boolean;
  streamingReasoning?: string;
  streamingContent?: string;
  onSendMessage: (message: string) => void;
  onStopGeneration?: () => void;
  onThinkingToggle: () => void;
}

export function ChatWindow({
  messages,
  thinkingEnabled,
  conversationTitle,
  isStreaming = false,
  isLoadingMessages = false,
  isSending = false,
  streamingReasoning,
  streamingContent,
  onSendMessage,
  onStopGeneration,
  onThinkingToggle,
}: ChatWindowProps) {
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 glass">
        <div>
          <h1 className="text-lg font-semibold text-white flex items-center gap-2">
            {conversationTitle || '新对话'}
            {isStreaming && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            )}
          </h1>
          {isStreaming && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-blue-400">AI 正在思考并回复...</span>
            </div>
          )}
        </div>
        
        {/* 右上角模式切换 */}
        <ThinkingSwitcher
          thinkingEnabled={thinkingEnabled}
          onToggle={onThinkingToggle}
        />
      </div>

      {/* 消息列表 */}
      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        isLoading={isLoadingMessages}
        streamingReasoning={streamingReasoning}
        streamingContent={streamingContent}
      />

      {/* 输入区域 */}
      <InputArea
        onSend={onSendMessage}
        onStop={onStopGeneration}
        disabled={isSending}
        isStreaming={isStreaming}
        placeholder={isSending ? '发送中...' : `使用 ${thinkingEnabled ? 'R1 深度推理' : 'V3 快速对话'} 发送消息...`}
      />
    </div>
  );
}
