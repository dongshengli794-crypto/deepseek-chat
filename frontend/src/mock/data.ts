import type { Conversation, Message, ModelInfo } from '../types';

// 模型列表
export const models: ModelInfo[] = [
  {
    id: 'deepseek-reasoner',
    name: '推理模式',
    description: 'DeepSeek-R1 深度思考',
    icon: '🧠',
  },
  {
    id: 'deepseek-chat',
    name: '对话模式',
    description: 'DeepSeek-V3 快速响应',
    icon: '💬',
  },
];

// Mock 会话列表
export const mockConversations: Conversation[] = [
  {
    id: 1,
    title: '量子计算入门讨论',
    model: 'deepseek-reasoner',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T11:45:00Z',
  },
  {
    id: 2,
    title: 'Python 代码优化',
    model: 'deepseek-chat',
    created_at: '2024-01-14T14:20:00Z',
    updated_at: '2024-01-14T15:30:00Z',
  },
  {
    id: 3,
    title: '机器学习算法解析',
    model: 'deepseek-reasoner',
    created_at: '2024-01-13T09:00:00Z',
    updated_at: '2024-01-13T10:15:00Z',
  },
];

// Mock 消息列表 (带思考过程)
export const mockMessages: Message[] = [
  {
    id: 1,
    conversation_id: 1,
    role: 'user',
    content: '请解释一下量子计算的基本原理',
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    conversation_id: 1,
    role: 'assistant',
    content: `量子计算是一种利用量子力学原理进行计算的新型计算范式。

## 核心概念

### 1. 量子比特 (Qubit)
与经典比特只能是 0 或 1 不同，量子比特可以同时处于 0 和 1 的叠加态：

\`\`\`
|ψ⟩ = α|0⟩ + β|1⟩
\`\`\`

其中 |α|² + |β|² = 1

### 2. 量子叠加
量子系统可以同时存在于多个状态的叠加中，这使得量子计算机能够并行处理大量计算。

### 3. 量子纠缠
两个或多个量子比特之间可以建立强关联，测量其中一个会瞬间影响另一个。

## 示例代码

\`\`\`python
from qiskit import QuantumCircuit, execute, Aer

# 创建量子电路
qc = QuantumCircuit(2, 2)
qc.h(0)  # Hadamard 门
qc.cx(0, 1)  # CNOT 门
qc.measure([0, 1], [0, 1])

# 运行模拟
simulator = Aer.get_backend('qasm_simulator')
result = execute(qc, simulator, shots=1000).result()
print(result.get_counts())
\`\`\`

量子计算在密码学、药物研发、优化问题等领域有巨大潜力。`,
    reasoning_content: `让我思考一下如何解释量子计算...

首先，我需要从最基本的概念开始：
1. 经典计算 vs 量子计算的区别
2. 量子比特的特性
3. 为什么量子计算强大

用户似乎是初学者，所以我应该：
- 使用简单易懂的语言
- 给出具体的例子
- 包含一些代码示例增加实用性

我会从量子比特、叠加态、纠缠这三个核心概念入手...`,
    created_at: '2024-01-15T10:31:00Z',
  },
  {
    id: 3,
    conversation_id: 1,
    role: 'user',
    content: '量子计算机目前有哪些实际应用？',
    created_at: '2024-01-15T11:00:00Z',
  },
  {
    id: 4,
    conversation_id: 1,
    role: 'assistant',
    content: `量子计算目前正在多个领域展现潜力：

## 主要应用领域

| 领域 | 应用 | 进展 |
|------|------|------|
| 密码学 | 量子密钥分发 | 已商用 |
| 药物研发 | 分子模拟 | 研究阶段 |
| 金融 | 投资组合优化 | 试验中 |
| 人工智能 | 量子机器学习 | 早期研究 |

> **注意**: 目前大多数应用仍处于实验阶段，真正的"量子优势"还需要技术突破。`,
    reasoning_content: `用户想了解实际应用，我需要：
1. 列出主要应用领域
2. 说明每个领域的具体应用
3. 诚实地指出当前的局限性

让我组织一个清晰的回答，用表格会更直观...`,
    created_at: '2024-01-15T11:01:00Z',
  },
];
