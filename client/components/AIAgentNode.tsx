"use client";

import { Handle, Position } from "@xyflow/react";
import {
  Brain,
  Bot,
  Coins,
  Code,
  Link,
  Workflow,
  GitBranch,
} from "lucide-react";

export interface AIAgentData {
  label: string;
  description: string;
  icon?: string;
}

interface AIAgentNodeProps {
  data: AIAgentData;
  id: string;
  activeNodeIds?: string[];
}

function AIAgentNode({ data, id, activeNodeIds = [] }: AIAgentNodeProps) {
  const isHighlighted =
    activeNodeIds.length === 0 || activeNodeIds.includes(id);

  const getIconConfig = (iconName?: string) => {
    switch (iconName) {
      case "brain":
        return {
          icon: Brain,
          color: "blue",
          bgColor: isHighlighted ? "bg-blue-500/20" : "bg-blue-900/50",
          iconColor: isHighlighted ? "text-blue-400" : "text-blue-400/50",
          borderColor: isHighlighted ? "border-blue-500" : "border-blue-500/30",
          shadowColor: "shadow-[0_0_30px_rgba(59,130,246,0.3)]",
        };
      case "bot":
        return {
          icon: Bot,
          color: "purple",
          bgColor: isHighlighted ? "bg-purple-500/20" : "bg-purple-900/50",
          iconColor: isHighlighted ? "text-purple-400" : "text-purple-400/50",
          borderColor: isHighlighted
            ? "border-purple-500"
            : "border-purple-500/30",
          shadowColor: "shadow-[0_0_30px_rgba(147,51,234,0.3)]",
        };
      case "coins":
        return {
          icon: Coins,
          color: "green",
          bgColor: isHighlighted ? "bg-green-500/20" : "bg-green-900/50",
          iconColor: isHighlighted ? "text-green-400" : "text-green-400/50",
          borderColor: isHighlighted
            ? "border-green-500"
            : "border-green-500/30",
          shadowColor: "shadow-[0_0_30px_rgba(34,197,94,0.3)]",
        };
      case "code":
        return {
          icon: Code,
          color: "indigo",
          bgColor: isHighlighted ? "bg-indigo-500/20" : "bg-indigo-900/50",
          iconColor: isHighlighted ? "text-indigo-400" : "text-indigo-400/50",
          borderColor: isHighlighted
            ? "border-indigo-500"
            : "border-indigo-500/30",
          shadowColor: "shadow-[0_0_30px_rgba(99,102,241,0.3)]",
        };
      case "link":
        return {
          icon: Link,
          color: "teal",
          bgColor: isHighlighted ? "bg-teal-500/20" : "bg-teal-900/50",
          iconColor: isHighlighted ? "text-teal-400" : "text-teal-400/50",
          borderColor: isHighlighted ? "border-teal-500" : "border-teal-500/30",
          shadowColor: "shadow-[0_0_30px_rgba(45,212,191,0.3)]",
        };
      case "workflow":
        return {
          icon: Workflow,
          color: "orange",
          bgColor: isHighlighted ? "bg-orange-500/20" : "bg-orange-900/50",
          iconColor: isHighlighted ? "text-orange-400" : "text-orange-400/50",
          borderColor: isHighlighted
            ? "border-orange-500"
            : "border-orange-500/30",
          shadowColor: "shadow-[0_0_30px_rgba(249,115,22,0.3)]",
        };
      case "gitBranch":
        return {
          icon: GitBranch,
          color: "yellow",
          bgColor: isHighlighted ? "bg-yellow-500/20" : "bg-yellow-900/50",
          iconColor: isHighlighted ? "text-yellow-400" : "text-yellow-400/50",
          borderColor: isHighlighted
            ? "border-yellow-500"
            : "border-yellow-500/30",
          shadowColor: "shadow-[0_0_30px_rgba(234,179,8,0.3)]",
        };
      default:
        return {
          icon: Brain,
          color: "blue",
          bgColor: isHighlighted ? "bg-blue-500/20" : "bg-blue-900/50",
          iconColor: isHighlighted ? "text-blue-400" : "text-blue-400/50",
          borderColor: isHighlighted ? "border-blue-500" : "border-blue-500/30",
          shadowColor: "shadow-[0_0_30px_rgba(59,130,246,0.3)]",
        };
    }
  };

  const config = getIconConfig(data.icon);
  const IconComponent = config.icon;

  return (
    <div
      className={`relative bg-gray-800 rounded-lg shadow-lg border-2 transition-all duration-300 w-[250px] ${
        isHighlighted
          ? `${config.borderColor} ${config.shadowColor} opacity-100 scale-105`
          : `${config.borderColor} hover:${config.borderColor.replace("/30", "/50")}`
      } ${!isHighlighted ? "opacity-40" : ""}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 border-2 border-gray-900 transition-colors duration-300 ${
          isHighlighted ? `bg-${config.color}-500` : `bg-${config.color}-500/50`
        }`}
      />

      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`p-2 rounded-lg transition-colors duration-300 ${config.bgColor}`}
          >
            <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
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
          isHighlighted ? `bg-${config.color}-500` : `bg-${config.color}-500/50`
        }`}
      />
    </div>
  );
}

export default AIAgentNode;
