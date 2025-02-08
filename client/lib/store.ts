import { create } from 'zustand';
import { TokenData } from '@/components/TokenNode';
import { ElizaData } from '@/components/ElizaNode';
import { AIAgentData } from '@/components/AIAgentNode';

type NodeData = TokenData | ElizaData | AIAgentData;

interface Store {
  updateNodeData: (nodeId: string, data: NodeData) => void;
}

export const useStore = create<Store>((set) => ({
  updateNodeData: (nodeId, data) => {
    // This function will be called by the mutation in the React Flow component
    // The actual update will happen through Liveblocks
  },
})); 