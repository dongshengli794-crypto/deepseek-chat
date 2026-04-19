import { useState, useEffect, useCallback, useRef } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatWindow } from './components/Chat/ChatWindow';
import {
  checkHealth,
  getConversations,
  createConversation,
  getConversationDetail,
  deleteConversation,
  updateConversation,
  sendChatMessage,
} from './services/api';
import { useToast } from './contexts/ToastContext';
import type { Conversation, Message, HealthResponse } from './types';

function App() {
  const { showError, showSuccess, showWarning } = useToast();

  // 健康检查状态
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const healthCheckIntervalRef = useRef<number | null>(null);
  const wasDisconnectedRef = useRef(false);
  
  // 用于取消请求的 AbortController
  const abortControllerRef = useRef<AbortController | null>(null);

  // 会话状态
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // 加载状态
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // 思考模式状态（默认使用 V3 快速对话）
  const [thinkingEnabled, setThinkingEnabled] = useState(false);
  
  // 流式输出状态
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingReasoning, setStreamingReasoning] = useState('');
  const [streamingContent, setStreamingContent] = useState('');

  // 健康检查（带重连逻辑）
  const performHealthCheck = useCallback(async () => {
    try {
      const result = await checkHealth();
      setHealth(result);
      setHealthError(null);
      // 如果之前断开连接，现在恢复了，显示成功提示
      if (wasDisconnectedRef.current) {
        showSuccess('后端连接已恢复');
        wasDisconnectedRef.current = false;
      }
    } catch (err) {
      setHealth(null);
      setHealthError(err instanceof Error ? err.message : '连接失败');
      // 仅在首次断开时提示
      if (!wasDisconnectedRef.current) {
        showWarning('后端连接断开，正在尝试重连...');
        wasDisconnectedRef.current = true;
      }
    }
  }, [showSuccess, showWarning]);

  // 初始健康检查 + 定时轮询
  useEffect(() => {
    performHealthCheck();
    // 每 30 秒检查一次健康状态
    healthCheckIntervalRef.current = window.setInterval(performHealthCheck, 30000);
    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [performHealthCheck]);

  // 加载会话列表
  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      console.error('加载会话列表失败:', err);
      showError('加载会话列表失败，请刷新页面重试');
    } finally {
      setIsLoadingConversations(false);
    }
  }, [showError]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 加载会话消息
  const loadMessages = useCallback(async (conversationId: number) => {
    setIsLoadingMessages(true);
    try {
      const detail = await getConversationDetail(conversationId);
      setMessages(detail.messages);
      setThinkingEnabled(detail.thinking_enabled);
    } catch (err) {
      console.error('加载消息失败:', err);
      showError('加载消息失败，请重试');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [showError]);

  // 获取当前会话
  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );

  // 新建会话
  const handleNewChat = async () => {
    try {
      const newConv = await createConversation('新对话', thinkingEnabled);
      setConversations([newConv, ...conversations]);
      setCurrentConversationId(newConv.id);
      setMessages([]);
    } catch (err) {
      console.error('创建会话失败:', err);
      showError('创建会话失败，请检查网络连接');
    }
  };

  // 选择会话
  const handleSelectConversation = async (id: number) => {
    setCurrentConversationId(id);
    await loadMessages(id);
  };

  // 删除会话
  const handleDeleteConversation = async (id: number) => {
    try {
      await deleteConversation(id);
      setConversations(conversations.filter((c) => c.id !== id));
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      showSuccess('会话已删除');
    } catch (err) {
      console.error('删除会话失败:', err);
      showError('删除会话失败，请重试');
    }
  };

  // 切换思考模式
  const handleThinkingToggle = async () => {
    const newValue = !thinkingEnabled;
    setThinkingEnabled(newValue);
    
    if (currentConversationId) {
      try {
        await updateConversation(currentConversationId, { thinking_enabled: newValue });
        // 更新本地会话列表
        setConversations(conversations.map((c) =>
          c.id === currentConversationId ? { ...c, thinking_enabled: newValue } : c
        ));
      } catch (err) {
        console.error('更新会话失败:', err);
        // 回滚状态
        setThinkingEnabled(!newValue);
        showError('切换模式失败，请重试');
      }
    }
  };

  // 停止生成
  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // 发送消息
  const handleSendMessage = async (content: string) => {
    // 防止重复发送
    if (isSending || isStreaming) {
      return;
    }

    // 检查后端连接
    if (!health) {
      showError('后端未连接，请等待连接恢复后重试');
      return;
    }

    setIsSending(true);

    // 如果没有当前会话，先创建一个
    let convId = currentConversationId;
    if (!convId) {
      try {
        const newConv = await createConversation('新对话', thinkingEnabled);
        setConversations([newConv, ...conversations]);
        setCurrentConversationId(newConv.id);
        convId = newConv.id;
      } catch (err) {
        console.error('创建会话失败:', err);
        showError('创建会话失败，请检查网络连接');
        setIsSending(false);
        return;
      }
    }

    // 添加用户消息到本地
    const userMessage: Message = {
      id: Date.now(),
      conversation_id: convId,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // 添加空的 AI 消息占位
    const aiMessageId = Date.now() + 1;
    const aiMessage: Message = {
      id: aiMessageId,
      conversation_id: convId,
      role: 'assistant',
      content: '',
      reasoning_content: '',
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, aiMessage]);

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();

    // 开始流式输出
    setIsStreaming(true);
    setIsSending(false);
    setStreamingReasoning('');
    setStreamingContent('');

    let fullReasoning = '';
    let fullContent = '';
    let hasError = false;
    let wasStopped = false;

    try {
      for await (const chunk of sendChatMessage(convId, content, thinkingEnabled, abortControllerRef.current.signal)) {
        if (chunk.type === 'reasoning') {
          fullReasoning += chunk.content;
          setStreamingReasoning(fullReasoning);
        } else if (chunk.type === 'content') {
          fullContent += chunk.content;
          setStreamingContent(fullContent);
        } else if (chunk.type === 'error') {
          console.error('聊天错误:', chunk.content);
          hasError = true;
          // 检查是否是限流错误
          if (chunk.content.includes('429') || chunk.content.toLowerCase().includes('rate limit')) {
            showError('请求过于频繁，请稍后再试');
            fullContent = '⚠️ 请求过于频繁，请稍后再试';
          } else if (chunk.content.includes('401') || chunk.content.includes('403')) {
            showError('API 认证失败，请检查配置');
            fullContent = '⚠️ API 认证失败';
          } else {
            showError(`AI 响应错误: ${chunk.content}`);
            fullContent = `⚠️ 错误: ${chunk.content}`;
          }
          setStreamingContent(fullContent);
        }
        
        if (chunk.done) {
          break;
        }
      }
    } catch (err) {
      // 检查是否是用户主动取消
      if (err instanceof Error && err.name === 'AbortError') {
        wasStopped = true;
        fullContent = fullContent || '(已停止生成)';
      } else {
        console.error('发送消息失败:', err);
        hasError = true;
        const errorMsg = err instanceof Error ? err.message : String(err);
        
        // 检查网络错误
        if (errorMsg.includes('fetch') || errorMsg.includes('network') || errorMsg.includes('Network')) {
          showError('网络连接失败，请检查网络');
          fullContent = '⚠️ 网络连接失败，请检查网络后重试';
        } else {
          showError(`发送失败: ${errorMsg}`);
          fullContent = `⚠️ 发送失败: ${errorMsg}`;
        }
      }
    }

    // 清理 AbortController
    abortControllerRef.current = null;

    // 完成流式输出，更新消息
    setMessages((prev) =>
      prev.map((m) =>
        m.id === aiMessageId
          ? {
              ...m,
              content: fullContent,
              reasoning_content: fullReasoning || undefined,
            }
          : m
      )
    );
    setIsStreaming(false);
    setStreamingReasoning('');
    setStreamingContent('');

    // 刷新会话列表（获取更新后的标题）
    if (!hasError && !wasStopped) {
      loadConversations();
    }
  };

  return (
    <Layout
      sidebar={
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          thinkingEnabled={thinkingEnabled}
          isLoading={isLoadingConversations}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onThinkingToggle={handleThinkingToggle}
        />
      }
    >
      <ChatWindow
        messages={messages}
        thinkingEnabled={thinkingEnabled}
        conversationTitle={currentConversation?.title}
        isStreaming={isStreaming}
        isLoadingMessages={isLoadingMessages}
        isSending={isSending}
        streamingReasoning={streamingReasoning}
        streamingContent={streamingContent}
        onSendMessage={handleSendMessage}
        onStopGeneration={handleStopGeneration}
        onThinkingToggle={handleThinkingToggle}
      />

      {/* 后端连接状态指示器 */}
      <div className="fixed bottom-4 right-4 z-50">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium glass border transition-all duration-300 ${
            health
              ? 'border-green-500/30 text-green-400'
              : healthError
              ? 'border-red-500/30 text-red-400'
              : 'border-yellow-500/30 text-yellow-400'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {health ? (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            ) : healthError ? (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            ) : (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
              </>
            )}
          </span>
          {health ? 'API 已连接' : healthError ? 'API 未连接' : '连接中...'}
        </div>
      </div>
    </Layout>
  );
}

export default App;
