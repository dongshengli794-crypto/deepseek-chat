import { useState } from 'react';
import type { Conversation } from '../../types';
import { ConversationList } from './ConversationList';
import { Button } from '../common/Button';

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: number | null;
  thinkingEnabled: boolean;
  isLoading?: boolean;
  onNewChat: () => void;
  onSelectConversation: (id: number) => void;
  onDeleteConversation: (id: number) => void;
  onThinkingToggle: () => void;
}

export function Sidebar({
  conversations,
  currentConversationId,
  isLoading = false,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isConvExpanded, setIsConvExpanded] = useState(true);

  return (
    <div
      className={`glass-strong border-r border-white/5 flex flex-col h-full transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-72'
      }`}
    >
      {/* 顶部: 新建会话按钮 + 折叠按钮 */}
      <div className="p-3 border-b border-white/5 flex items-center gap-2">
        {!isCollapsed ? (
          <>
            <button
              onClick={onNewChat}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建会话
            </button>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
              title="折叠侧边栏"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 mx-auto"
              title="展开侧边栏"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={onNewChat}
              className="p-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-all duration-200 mx-auto shadow-lg shadow-blue-500/25"
              title="新建会话"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* 会话列表 */}
      {!isCollapsed ? (
        <ConversationList
          conversations={conversations}
          currentId={currentConversationId}
          isLoading={isLoading}
          onSelect={onSelectConversation}
          onDelete={onDeleteConversation}
        />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* 折叠状态下的会话列表标题 */}
          <button
            onClick={() => setIsConvExpanded(!isConvExpanded)}
            className="w-full p-2 hover:bg-white/5 transition-all duration-200 flex items-center justify-center"
            title={isConvExpanded ? '折叠会话' : '展开会话'}
          >
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isConvExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {isConvExpanded && (
            <div className="p-2 space-y-1">
              {conversations.length === 0 ? (
                <div className="p-2 text-center">
                  <span className="text-2xl">💭</span>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={`w-full p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                      currentConversationId === conv.id
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30'
                        : 'hover:bg-white/5 text-gray-400'
                    }`}
                    title={`${conv.title} (${conv.thinking_enabled ? 'R1 深度推理' : 'V3 快速对话'})`}
                  >
                    <span className="text-lg">
                      {conv.thinking_enabled ? '🧠' : '💬'}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* 底部信息 */}
      <div className="p-3 border-t border-white/5">
        {!isCollapsed ? (
          <div className="text-xs text-center">
            <span className="gradient-text font-medium">DeepSeek AI</span>
            <span className="text-gray-500 ml-1">v1.0</span>
          </div>
        ) : (
          <div className="text-xs text-gray-500 text-center">
            v1.0
          </div>
        )}
      </div>
    </div>
  );
}
