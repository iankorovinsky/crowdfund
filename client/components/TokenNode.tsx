import { Handle, Position } from "@xyflow/react";
import { Coins } from "lucide-react";
import { Input } from "./ui/input";
import { useCallback } from "react";
import { shallow } from "zustand/shallow";
import { useStore } from "@/lib/store";

export interface TokenData {
  label: string;
  description: string;
  tokenName: string;
  supply: string;
  issuance: string;
}

interface TokenNodeProps {
  data: TokenData;
  id: string;
  activeNodeIds?: string[];
}

function TokenNode({ data, id, activeNodeIds = [] }: TokenNodeProps) {
  const isHighlighted = activeNodeIds.length === 0 || activeNodeIds.includes(id);
  const updateNodeData = useStore(state => state.updateNodeData);

  const onChange = useCallback((field: keyof TokenData, value: string) => {
    updateNodeData(id, {
      ...data,
      [field]: value
    });
  }, [id, data, updateNodeData]);

  return (
    <div
      className={`relative bg-gray-800 rounded-lg shadow-lg border-2 transition-all duration-300 w-[300px] ${
        isHighlighted
          ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)] opacity-100 scale-105"
          : "border-green-500/30 hover:border-green-500/50"
      } ${!isHighlighted ? "opacity-40" : ""}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 border-2 border-gray-900 transition-colors duration-300 ${
          isHighlighted ? "bg-green-500" : "bg-green-500/50"
        }`}
      />

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`p-2 rounded-lg transition-colors duration-300 ${
              isHighlighted ? "bg-green-500/20" : "bg-gray-900/50"
            }`}
          >
            <Coins
              className={`w-6 h-6 transition-colors duration-300 ${
                isHighlighted ? "text-green-400" : "text-green-400/50"
              }`}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-200">{data.label}</h3>
            <p className="text-sm text-gray-400">{data.description}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Token Name (3-4 chars)</label>
            <Input 
              placeholder="e.g., COOL"
              value={data.tokenName}
              onChange={(e) => onChange('tokenName', e.target.value)}
              className="bg-gray-900/50 border-gray-700"
              maxLength={4}
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Maximum Supply</label>
            <Input 
              type="number"
              placeholder="e.g., 1000000"
              value={data.supply}
              onChange={(e) => onChange('supply', e.target.value)}
              className="bg-gray-900/50 border-gray-700"
              min="0"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Initial Issuance</label>
            <Input 
              type="number"
              placeholder="e.g., 100000"
              value={data.issuance}
              onChange={(e) => onChange('issuance', e.target.value)}
              className="bg-gray-900/50 border-gray-700"
              min="0"
            />
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 border-2 border-gray-900 transition-colors duration-300 ${
          isHighlighted ? "bg-green-500" : "bg-green-500/50"
        }`}
      />
    </div>
  );
}

export default TokenNode; 