import type { Message } from '../../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ThinkingBlock } from './ThinkingBlock';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
  streamingReasoning?: string;
  streamingContent?: string;
}

export function MessageItem({
  message,
  isStreaming = false,
  streamingReasoning,
  streamingContent,
}: MessageItemProps) {
  const isUser = message.role === 'user';
  
  // 流式输出时使用 streaming 内容，否则使用消息内容
  const displayContent = isStreaming 
    ? (streamingContent ?? '') 
    : message.content;
  const displayReasoning = isStreaming 
    ? (streamingReasoning ?? '') 
    : (message.reasoning_content ?? '');

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* 头像 */}
      <div className="flex-shrink-0 relative">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30'
              : 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30'
          }`}
        >
          {isUser ? '👤' : '🤖'}
        </div>
        {!isUser && isStreaming && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
        )}
      </div>

      {/* 消息内容 */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        {/* 角色标识 */}
        <div className={`text-xs text-gray-500 mb-2 ${isUser ? 'text-right' : ''}`}>
          <span className={isUser ? 'text-blue-400' : 'gradient-text font-medium'}>
            {isUser ? '你' : 'DeepSeek AI'}
          </span>
          <span className="ml-2 text-gray-600">
            {new Date(message.created_at).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* 消息气泡 */}
        <div
          className={`inline-block rounded-2xl px-5 py-3 ${
            isUser
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-tr-sm shadow-lg shadow-blue-500/20'
              : 'glass-strong text-gray-100 rounded-tl-sm border border-white/5'
          }`}
        >
          {/* 思考过程 (仅 AI 消息且有思考内容) */}
          {!isUser && (displayReasoning || (isStreaming && !displayContent)) && (
            <ThinkingBlock
              content={displayReasoning}
              isStreaming={isStreaming && !displayContent}
            />
          )}

          {/* 消息内容 */}
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-invert max-w-none">
              {displayContent ? (
                <>
                  <MarkdownRenderer content={displayContent} />
                  {isStreaming && (
                    <span className="inline-block w-2 h-5 bg-gradient-to-t from-blue-400 to-purple-400 rounded-sm animate-pulse ml-0.5"></span>
                  )}
                </>
              ) : isStreaming ? (
                <span className="inline-block w-2 h-5 bg-gradient-to-t from-blue-400 to-purple-400 rounded-sm animate-pulse"></span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
