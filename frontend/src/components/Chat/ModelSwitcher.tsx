import type { ModelType } from '../../types';
import { models } from '../../mock/data';

interface ModelSwitcherProps {
  currentModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

export function ModelSwitcher({ currentModel, onModelChange }: ModelSwitcherProps) {
  const currentModelInfo = models.find((m) => m.id === currentModel);
  const otherModel = models.find((m) => m.id !== currentModel);

  const handleSwitch = () => {
    if (otherModel) {
      onModelChange(otherModel.id);
    }
  };

  return (
    <button
      onClick={handleSwitch}
      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
      title={`切换到${otherModel?.name}`}
    >
      <span className="text-lg">{currentModelInfo?.icon}</span>
      <span className="text-sm text-gray-200">{currentModelInfo?.name}</span>
      <svg 
        className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    </button>
  );
}
