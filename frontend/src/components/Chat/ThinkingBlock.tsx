import { useState } from 'react';

interface ThinkingBlockProps {
  content: string;
  isStreaming?: boolean;
}

export function ThinkingBlock({ content, isStreaming = false }: ThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!content && !isStreaming) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-all duration-200 group"
      >
        <span className="text-base p-1 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">🧠</span>
        <span className="font-medium">AI 思考过程</span>
        {isStreaming && (
          <span className="flex items-center gap-1.5 ml-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-xs text-purple-300">深度思考中...</span>
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="mt-3 p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl relative overflow-hidden">
          {/* 装饰性背景 */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-xl"></div>
          
          <div className="relative text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
            {content || (isStreaming ? '正在思考...' : '')}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-gradient-to-t from-purple-400 to-pink-400 rounded-sm animate-pulse ml-0.5"></span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
