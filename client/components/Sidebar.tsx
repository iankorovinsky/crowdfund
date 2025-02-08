"use client";

import React from "react";
import { Brain } from "lucide-react";

export interface NodeType {
  type: string;
  label: string;
  description: string;
}

const nodeTypes: NodeType[] = [
  {
    type: "aiagent",
    label: "AI Agent",
    description: "An AI agent that can make trading decisions",
  },
  {
    type: "blocks",
    label: "Blocks",
    description: "An AI agent that can make trading decisions",
  },
];

export function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(nodeType)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-80 h-full bg-gray-50 p-4 border-r border-gray-200">
      <h2 className="text-lg font-semibold mb-4">AI Agents</h2>
      <div className="space-y-3">
        {nodeTypes.map((node, index) => (
          <div
            key={index}
            className="flex items-start p-3 bg-white rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow duration-200"
            draggable
            onDragStart={(e) => onDragStart(e, node)}
            style={{ borderLeft: "4px solid #3B82F6" }}
          >
            <div className="p-2 bg-gray-50 rounded-lg mr-3">
              <Brain className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">{node.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{node.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
