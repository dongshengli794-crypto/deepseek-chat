import { useState } from 'react';
import type { Conversation } from '../../types';

interface ConversationListProps {
  conversations: Conversation[];
  currentId: number | null;
  isLoading?: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
}

export function ConversationList({
  conversations,
  currentId,
  isLoading = false,
  onSelect,
  onDelete,
}: ConversationListProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 折叠标题 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
      >
        <span className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          历史会话
        </span>
        <span className="text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 px-2 py-0.5 rounded-full text-blue-300">
          {conversations.length}
        </span>
      </button>

      {/* 会话列表 */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-4 h-32">
              <div className="text-center text-gray-500">
                <div className="w-8 h-8 border-2 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin mx-auto mb-3"></div>
                <div className="text-sm text-gray-400">加载中...</div>
              </div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex items-center justify-center p-4 h-32">
              <div className="text-center">
                <div className="text-4xl mb-3 animate-float">💭</div>
                <div className="text-sm text-gray-400">暂无会话</div>
                <div className="text-xs text-gray-500 mt-1">点击上方按钮开始新对话</div>
              </div>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                    currentId === conv.id
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white shadow-lg shadow-blue-500/10'
                      : 'hover:bg-white/5 text-gray-300 border border-transparent'
                  }`}
                >
                  <span 
                    className={`text-lg p-1.5 rounded-lg ${
                      conv.thinking_enabled 
                        ? 'bg-purple-500/20' 
                        : 'bg-blue-500/20'
                    }`}
                    title={conv.thinking_enabled ? 'R1 深度推理' : 'V3 快速对话'}
                  >
                    {conv.thinking_enabled ? '🧠' : '💬'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate font-medium">{conv.title}</div>
                    <div className="text-xs text-gray-500">{formatDate(conv.updated_at)}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                    title="删除会话"
                  >
                    <svg className="w-4 h-4 text-gray-400 hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
