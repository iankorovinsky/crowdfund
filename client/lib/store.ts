import { create } from "zustand";
import { AIAgentData } from "@/components/AIAgentNode";
import { TradingPair } from "@/components/TradingNode";

type NodeData = AIAgentData & {
  symbol?: TradingPair;
};

interface Store {
  updateNodeData: (nodeId: string, data: NodeData) => void;
}

export const useStore = create<Store>(() => ({
  updateNodeData: () => {
    // This function will be called by the mutation in the React Flow component
    // The actual update will happen through Liveblocks
  },
}));
