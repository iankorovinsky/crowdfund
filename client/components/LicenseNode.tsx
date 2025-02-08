import { Handle, Position } from "@xyflow/react";
import { Code } from "lucide-react";
import { Input } from "./ui/input";
import { useCallback } from "react";
import { useStore } from "@/lib/store";

export interface LicenseData {
  label: string;
  description: string;
  licenseTermsId: string;
}

interface LicenseNodeProps {
  data: LicenseData;
  id: string;
  activeNodeIds?: string[];
}

function LicenseNode({ data, id, activeNodeIds = [] }: LicenseNodeProps) {
  const isHighlighted = activeNodeIds.length === 0 || activeNodeIds.includes(id);
  const updateNodeData = useStore(state => state.updateNodeData);

  const onChange = useCallback((field: keyof LicenseData, value: string) => {
    updateNodeData(id, {
      ...data,
      [field]: value
    });
  }, [id, data, updateNodeData]);

  return (
    <div
      className={`relative bg-gray-800 rounded-lg shadow-lg border-2 transition-all duration-300 w-[300px] ${
        isHighlighted
          ? "border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)] opacity-100 scale-105"
          : "border-purple-500/30 hover:border-purple-500/50"
      } ${!isHighlighted ? "opacity-40" : ""}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 border-2 border-gray-900 transition-colors duration-300 ${
          isHighlighted ? "bg-purple-500" : "bg-purple-500/50"
        }`}
      />

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`p-2 rounded-lg transition-colors duration-300 ${
              isHighlighted ? "bg-purple-500/20" : "bg-gray-900/50"
            }`}
          >
            <Code
              className={`w-6 h-6 transition-colors duration-300 ${
                isHighlighted ? "text-purple-400" : "text-purple-400/50"
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
            <label className="text-sm text-gray-400 mb-1 block">License Terms ID</label>
            <Input 
              placeholder="Enter license terms ID..."
              value={data.licenseTermsId}
              onChange={(e) => onChange('licenseTermsId', e.target.value)}
              className="bg-gray-900/50 border-gray-700"
            />
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 border-2 border-gray-900 transition-colors duration-300 ${
          isHighlighted ? "bg-purple-500" : "bg-purple-500/50"
        }`}
      />
    </div>
  );
}

export default LicenseNode; 