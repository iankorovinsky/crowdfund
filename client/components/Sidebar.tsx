"use client";

import React from "react";
import { Database, FileSearch, Code } from "lucide-react";

export interface NodeType {
  type: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

const nodeTypes: NodeType[] = [
  {
    type: "database",
    label: "Database",
    icon: Database,
    color: "#ff9900",
  },
  {
    type: "search",
    label: "Search",
    icon: FileSearch,
    color: "#00ff99",
  },
  {
    type: "code",
    label: "Code",
    icon: Code,
    color: "#9900ff",
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
    <div className="w-64 h-full bg-gray-100 p-4 border-r border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Node Types</h2>
      <div className="space-y-2">
        {nodeTypes.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.type}
              className="flex items-center p-2 bg-white rounded-lg shadow cursor-move hover:bg-gray-50"
              draggable
              onDragStart={(e) => onDragStart(e, node)}
              style={{ borderLeft: `4px solid ${node.color}` }}
            >
              <Icon className="w-5 h-5 mr-2" style={{ color: node.color }} />
              <span>{node.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
