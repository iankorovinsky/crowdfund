"use client";

import React, { useState, useMemo } from "react";
import { Brain, Search } from "lucide-react";
import { Input } from "./ui/input";

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
  {
    type: "transformer",
    label: "Transformer",
    description: "Transform and process data in your pipeline",
  },
  {
    type: "classifier",
    label: "Classifier",
    description: "Classify and categorize inputs using ML",
  },
  {
    type: "connector",
    label: "Connector",
    description: "Connect to external services and APIs",
  },
];

interface SidebarProps {
  className: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodeTypes;
    
    const query = searchQuery.toLowerCase();
    return nodeTypes.filter(
      node =>
        node.label.toLowerCase().includes(query) ||
        node.description.toLowerCase().includes(query) ||
        node.type.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(nodeType)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className={className}>
      <div className="mb-4 relative">
        <Input
          type="text"
          placeholder="Search blocks..."
          className="pl-10 w-full bg-gray-800/50 border-gray-700/50 rounded-xl text-base transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 hover:border-gray-600"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
      
      <div className="space-y-3">
        {filteredNodes.map((node, index) => (
          <div
            key={index}
            className={`flex items-start p-3 rounded-lg shadow-sm cursor-move transition-all duration-200 ${
              isSearchFocused && searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase())
                ? "bg-blue-500/20 scale-102"
                : "bg-gray-900/50 hover:bg-gray-700"
            }`}
            draggable
            onDragStart={(e) => onDragStart(e, node)}
            style={{ borderLeft: "4px solid #3B82F6" }}
          >
            <div className={`p-2 rounded-lg mr-3 transition-colors duration-300 ${
              isSearchFocused && searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase())
                ? "bg-blue-500/20"
                : "bg-gray-800/50"
            }`}>
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
