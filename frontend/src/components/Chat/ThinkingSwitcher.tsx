interface ThinkingSwitcherProps {
  thinkingEnabled: boolean;
  onToggle: () => void;
}

export function ThinkingSwitcher({ thinkingEnabled, onToggle }: ThinkingSwitcherProps) {
  return (
    <div className="flex items-center glass rounded-xl p-1 border border-white/10">
      <button
        onClick={() => !thinkingEnabled && onToggle()}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
          !thinkingEnabled
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
        title="DeepSeek V3 快速对话"
      >
        <span className="text-base">💬</span>
        <span className="text-sm font-medium">V3 快速对话</span>
      </button>
      <button
        onClick={() => thinkingEnabled && onToggle()}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
          thinkingEnabled
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
        title="DeepSeek R1 深度推理"
      >
        <span className="text-base">🧠</span>
        <span className="text-sm font-medium">R1 深度推理</span>
      </button>
    </div>
  );
}
