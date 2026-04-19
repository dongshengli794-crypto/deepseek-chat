import type { ModelType, ModelInfo } from '../../types';
import { models } from '../../mock/data';

interface ModelSelectorProps {
  currentModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

export function ModelSelector({ currentModel, onModelChange }: ModelSelectorProps) {
  return (
    <div className="p-3 border-b border-gray-700">
      <div className="text-xs text-gray-500 mb-2 px-1">选择模型</div>
      <div className="space-y-1">
        {models.map((model: ModelInfo) => (
          <button
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
              currentModel === model.id
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50'
                : 'hover:bg-gray-700 text-gray-300'
            }`}
          >
            <span className="text-xl">{model.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{model.name}</div>
              <div className="text-xs text-gray-500 truncate">{model.description}</div>
            </div>
            {currentModel === model.id && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
