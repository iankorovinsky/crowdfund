"use client";

import { useQuery } from "@tanstack/react-query";
import React, { useState, useMemo } from "react";
import { Brain, Home, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import _ from "lodash";

export interface NodeType {
  type: string;
  label: string;
  description: string;
}

interface SidebarProps {
  className: string;
}

export function Sidebar({ className }: SidebarProps) {
  const {
    data: nodeTypes,
    error,
    isLoading,
  } = useQuery<NodeType[]>({
    queryKey: ["agents"],
    queryFn: () =>
      fetch("http://localhost:8000/agents").then((res) => res.json()),
  });
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodeTypes;

    const query = searchQuery.toLowerCase();
    return nodeTypes?.filter(
      (node) =>
        node.label.toLowerCase().includes(query) ||
        node.description.toLowerCase().includes(query) ||
        node.type.toLowerCase().includes(query),
    );
  }, [searchQuery, nodeTypes]);

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(nodeType),
    );
    event.dataTransfer.effectAllowed = "move";
  };

  if (isLoading || !nodeTypes) {
    return (
      <div className={className}>
        <h2 className="text-lg font-semibold mb-4 text-gray-200">
          Loading agents...
        </h2>
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
          onClick={() => router.push("/")}
        />
      </div>
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
        {filteredNodes &&
          filteredNodes.map((node, index) => (
            <div
              key={index}
              className={`flex items-start p-3 rounded-lg shadow-sm cursor-move transition-all duration-200 ${
                isSearchFocused &&
                searchQuery &&
                node.label.toLowerCase().includes(searchQuery.toLowerCase())
                  ? "bg-blue-500/20 scale-102"
                  : "bg-gray-900/50 hover:bg-gray-700"
              }`}
              draggable
              onDragStart={(e) => onDragStart(e, node)}
              style={{ borderLeft: "4px solid #3B82F6" }}
            >
              <div
                className={`p-2 rounded-lg mr-3 transition-colors duration-300 ${
                  isSearchFocused &&
                  searchQuery &&
                  node.label.toLowerCase().includes(searchQuery.toLowerCase())
                    ? "bg-blue-500/20"
                    : "bg-gray-800/50"
                }`}
              >
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
