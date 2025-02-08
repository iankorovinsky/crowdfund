"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Brain, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export interface NodeType {
  type: string;
  label: string;
  description: string;
}

interface SidebarProps {
  className: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { data: nodeTypes, error, isLoading } = useQuery<NodeType[]>({
    queryKey: ["agents"],
    queryFn: () => fetch("http://localhost:8000/agents").then((res) => res.json()),
  });
  const router = useRouter();

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(nodeType)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  if (isLoading || !nodeTypes) {
    return (
      <div className={className}>
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Loading agents...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <h2 className="text-lg font-semibold mb-4 text-gray-200">AI Agents</h2>
        <p className="text-red-400">{error.message}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-row items-start justify-between gap-2">
        <h2 className="text-lg font-semibold mb-4 text-gray-200">AI Agents</h2>
        <Home 
          className="w-6 h-6 text-blue-500 mt-1 cursor-pointer hover:text-blue-400 transition-colors" 
          onClick={() => router.push('/')}
        />
      </div>
      <div className="space-y-3">
        {nodeTypes.map((node, index) => (
          <div
            key={index}
            className="flex items-start p-3 bg-gray-900/50 rounded-lg shadow-sm cursor-move hover:bg-gray-700 transition-all duration-200"
            draggable
            onDragStart={(e) => onDragStart(e, node)}
            style={{ borderLeft: "4px solid #3B82F6" }}
          >
            <div className="p-2 bg-gray-800/50 rounded-lg mr-3">
              <Brain className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-200">{node.label}</h3>
              <p className="text-sm text-gray-400 mt-1">{node.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
