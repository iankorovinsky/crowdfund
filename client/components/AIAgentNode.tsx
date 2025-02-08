import { Handle, NodeProps, Position } from "@xyflow/react";
import { Brain } from "lucide-react";

export interface AIAgentData {
  label: string;
  description: string;
}

function AIAgentNode({ data }: { data: AIAgentData }) {
  return (
    <div className="relative bg-white rounded-lg shadow-lg border-2 border-blue-500 w-[250px]">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />

      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{data.label}</h3>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-2">{data.description}</p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  );
}

export default AIAgentNode;
