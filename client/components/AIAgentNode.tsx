import { Handle, Position } from "@xyflow/react";
import { Brain } from "lucide-react";

export interface AIAgentData {
  label: string;
  description: string;
}

interface AIAgentNodeProps {
  data: AIAgentData;
  id: string;
  activeNodeIds?: string[];
}

function AIAgentNode({ data, id, activeNodeIds = [] }: AIAgentNodeProps) {
  const isHighlighted =
    activeNodeIds.length === 0 || activeNodeIds.includes(id);

  return (
    <div
      className={`relative bg-gray-800 rounded-lg shadow-lg border-2 transition-all duration-300 w-[250px] ${
        isHighlighted
          ? "border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] opacity-100 scale-105"
          : "border-blue-500/30 hover:border-blue-500/50"
      } ${!isHighlighted ? "opacity-40" : ""}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 border-2 border-gray-900 transition-colors duration-300 ${
          isHighlighted ? "bg-blue-500" : "bg-blue-500/50"
        }`}
      />

      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`p-2 rounded-lg transition-colors duration-300 ${
              isHighlighted ? "bg-blue-500/20" : "bg-gray-900/50"
            }`}
          >
            <Brain
              className={`w-6 h-6 transition-colors duration-300 ${
                isHighlighted ? "text-blue-400" : "text-blue-400/50"
              }`}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-200">{data.label}</h3>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-2">{data.description}</p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 border-2 border-gray-900 transition-colors duration-300 ${
          isHighlighted ? "bg-blue-500" : "bg-blue-500/50"
        }`}
      />
    </div>
  );
}

export default AIAgentNode;
