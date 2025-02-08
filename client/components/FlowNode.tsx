import { Handle, Position } from "@xyflow/react";
import { Workflow } from "lucide-react";

export interface FlowData {
  label: string;
  description: string;
}

interface FlowNodeProps {
  data: FlowData;
  id: string;
  activeNodeIds?: string[];
}

function FlowNode({ data, id, activeNodeIds = [] }: FlowNodeProps) {
  const isHighlighted = activeNodeIds.length === 0 || activeNodeIds.includes(id);

  return (
    <div
      className={`relative bg-gray-800 rounded-lg shadow-lg border-2 transition-all duration-300 w-[300px] ${
        isHighlighted
          ? "border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)] opacity-100 scale-105"
          : "border-orange-500/30 hover:border-orange-500/50"
      } ${!isHighlighted ? "opacity-40" : ""}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 border-2 border-gray-900 transition-colors duration-300 ${
          isHighlighted ? "bg-orange-500" : "bg-orange-500/50"
        }`}
      />

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`p-2 rounded-lg transition-colors duration-300 ${
              isHighlighted ? "bg-orange-500/20" : "bg-gray-900/50"
            }`}
          >
            <Workflow
              className={`w-6 h-6 transition-colors duration-300 ${
                isHighlighted ? "text-orange-400" : "text-orange-400/50"
              }`}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-200">{data.label}</h3>
            <p className="text-sm text-gray-400">{data.description}</p>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 border-2 border-gray-900 transition-colors duration-300 ${
          isHighlighted ? "bg-orange-500" : "bg-orange-500/50"
        }`}
      />
    </div>
  );
}

export default FlowNode; 