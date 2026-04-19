import { useEffect, useRef } from 'react';
import type { Message } from '../../types';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  isStreaming?: boolean;
  isLoading?: boolean;
  streamingReasoning?: string;
  streamingContent?: string;
}

export function MessageList({
  messages,
  isStreaming = false,
  isLoading = false,
  streamingReasoning,
  streamingContent,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, streamingReasoning]);

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-2 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-transparent border-b-cyan-500 border-l-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="text-sm text-gray-400">加载消息中...</div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          {/* Logo */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-20 blur-xl animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-white/10 flex items-center justify-center">
              <span className="text-5xl animate-float">🤖</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">
            <span className="gradient-text">DeepSeek AI</span>
          </h2>
          <p className="text-gray-400 mb-8">
            智能对话，深度思考
          </p>
          
          <div className="flex gap-4 justify-center">
            <div className="flex items-center gap-2 px-4 py-3 glass rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-default">
              <span className="text-xl">💬</span>
              <div className="text-left">
                <div className="text-sm font-medium text-white">V3 快速对话</div>
                <div className="text-xs text-gray-500">快速响应</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 glass rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-default">
              <span className="text-xl">🧠</span>
              <div className="text-left">
                <div className="text-sm font-medium text-white">R1 深度推理</div>
                <div className="text-xs text-gray-500">思考过程</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((message, index) => {
        const isLastAssistant =
          index === messages.length - 1 && message.role === 'assistant';
        
        return (
          <MessageItem
            key={message.id}
            message={message}
            isStreaming={isLastAssistant && isStreaming}
            streamingReasoning={isLastAssistant ? streamingReasoning : undefined}
            streamingContent={isLastAssistant ? streamingContent : undefined}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
