"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Brain, Search, Code, Link, Workflow, GitBranch, Play, Square, Bot, Coins } from "lucide-react";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export interface NodeType {
  type: string;
  label: string;
  description: string;
  icon?: string;
  config?: {
    ipId?: string;
    licenseTermsId?: string;
    [key: string]: any;
  };
}

const nodeTypes: NodeType[] = [
  {
    type: "aiagent",
    label: "AI Agent",
    description: "Deploy an AI agent to handle tasks",
    icon: "brain",
    config: {
      ipId: "",
      licenseTermsId: "1"
    }
  },
  {
    type: "eliza",
    label: "Eliza Chatbot",
    description: "Create a customizable chatbot with personality",
    icon: "bot",
    config: {
      personality: "",
      responses: ""
    }
  },
  {
    type: "token",
    label: "Token Issuer",
    description: "Create and issue custom XRPL tokens",
    icon: "coins",
    config: {
      tokenName: "",
      supply: "",
      issuance: ""
    }
  },
  {
    type: "license",
    label: "License Terms",
    description: "Attach license terms to your agent",
    icon: "code",
    config: {
      licenseTermsId: "1"
    }
  },
  {
    type: "ipfs",
    label: "IPFS Storage",
    description: "Upload and store data on IPFS",
    icon: "link",
    config: {
      path: ""
    }
  },
  {
    type: "flow",
    label: "Flow Control",
    description: "Control the execution flow of your pipeline",
    icon: "workflow"
  },
  {
    type: "branch",
    label: "Branch",
    description: "Create conditional branches in your flow",
    icon: "gitBranch"
  }
];

interface SidebarProps {
  className: string;
  initialCost?: number;
  onStart?: () => void;
  onStop?: () => void;
  onRunningChange?: (isRunning: boolean) => void;
}

export function Sidebar({ 
  className, 
  initialCost = 0.1, 
  onStart, 
  onStop,
  onRunningChange 
}: SidebarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  // Mock values - replace with real data
  const profit = 0.25; // Example profit
  const royalties = profit * 0.1; // Example royalty calculation

  // Notify parent of running state changes
  useEffect(() => {
    onRunningChange?.(isRunning);
  }, [isRunning, onRunningChange]);

  const handleStart = () => {
    console.log("Opening start dialog");
    setShowStartDialog(true);
  };

  const handleStop = () => {
    console.log("Opening stop dialog");
    setShowStopDialog(true);
  };

  const confirmStart = () => {
    console.log("Confirming start");
    setIsRunning(true);
    setShowStartDialog(false);
    onStart?.();
  };

  const confirmStop = () => {
    console.log("Confirming stop");
    setIsRunning(false);
    setShowStopDialog(false);
    onStop?.();
  };

  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodeTypes;

    const query = searchQuery.toLowerCase();
    return nodeTypes.filter(
      (node) =>
        node.label.toLowerCase().includes(query) ||
        node.description.toLowerCase().includes(query) ||
        node.type.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "brain":
        return <Brain className="w-6 h-6 text-blue-400" />;
      case "bot":
        return <Bot className="w-6 h-6 text-purple-400" />;
      case "coins":
        return <Coins className="w-6 h-6 text-green-400" />;
      case "code":
        return <Code className="w-6 h-6 text-purple-400" />;
      case "link":
        return <Link className="w-6 h-6 text-green-400" />;
      case "workflow":
        return <Workflow className="w-6 h-6 text-orange-400" />;
      case "gitBranch":
        return <GitBranch className="w-6 h-6 text-yellow-400" />;
      default:
        return <Brain className="w-6 h-6 text-blue-400" />;
    }
  };

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(nodeType),
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <>
      <div className={className}>
        {/* Header with title and controls */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-200">AI Agents</h2>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleStart}
              disabled={isRunning}
              className={`${
                !isRunning 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              <Play className="w-4 h-4 mr-1" />
              Start
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleStop}
              disabled={!isRunning}
              className={`${
                isRunning 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              <Square className="w-4 h-4 mr-1" />
              Stop
            </Button>
          </div>
        </div>

        {/* Search input */}
        <div className="mb-4 relative">
          <Input
            type="text"
            placeholder="Search blocks..."
            className="pl-10 w-full bg-gray-900 border-gray-700 border rounded-xl text-base transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 hover:border-gray-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        
        {/* Nodes list */}
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
                {getIcon(node.icon || "brain")}
              </div>
              <div>
                <h3 className="font-medium text-gray-200">{node.label}</h3>
                <p className="text-sm text-gray-400 mt-1">{node.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start Trading Agent</DialogTitle>
            <DialogDescription className="pt-3">
              This will cost <span className="font-semibold text-white">{initialCost} ETH</span> to run. 
              Do you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowStartDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={confirmStart}
              className="bg-green-600 hover:bg-green-700"
            >
              Agree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stop Dialog */}
      <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Stop Trading Agent</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 pt-3">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400">Profit</span>
                  <span className="text-2xl font-semibold text-white">+{profit} ETH</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400">Royalties</span>
                  <span className="text-2xl font-semibold text-red-400">-{royalties} ETH</span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowStopDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={confirmStop}
              className="bg-red-600 hover:bg-red-700"
            >
              Agree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
