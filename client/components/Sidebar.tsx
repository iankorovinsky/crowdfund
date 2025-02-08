"use client";

import { useWorkflow } from "@/contexts/WorkflowContext";
import { useStorage } from "@/liveblocks.config";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Bot,
  Brain,
  Code,
  Coins,
  GitBranch,
  Link,
  Play,
  Search,
  Square,
  Workflow,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

export interface NodeType {
  type: string;
  label: string;
  description: string;
  icon?: string;
  agentId: string;
}

interface SidebarProps {
  className: string;
  initialCost?: number;
  onStart?: () => void;
  onStop?: () => void;
  onRunningChange?: (isRunning: boolean) => void;
}

interface WorkflowStatus {
  status: string;
  results?: any;
  error?: string;
}

const SYMBOL_NODE: NodeType = {
  type: "trading",
  label: "Symbol",
  description: "Select a crypto symbol for analysis",
  icon: "coins",
  agentId: "123021093821903812093801923",
};

export function Sidebar({
  className,
  initialCost = 0.1,
  onStart,
  onStop,
  onRunningChange,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const {
    isRunning,
    setIsRunning,
    currentWorkflowId,
    setWorkflowId,
    resetWorkflow,
  } = useWorkflow();

  const storage = useStorage((root) => ({
    nodes: root.nodes,
    edges: root.edges,
  }));

  const {
    data: nodeTypes,
    error,
    isLoading,
  } = useQuery<NodeType[]>({
    queryKey: ["blocks"],
    queryFn: async () => {
      const response = await fetch("http://localhost:8000/agents");
      if (!response.ok) {
        throw new Error("Failed to fetch blocks");
      }
      const data = await response.json();
      return data.map((agent: any) => ({
        ...agent,
        agentId: agent.id,
      }));
    },
  });

  // Add workflow status polling
  const { data: workflowStatus } = useQuery({
    queryKey: ["workflow-status", currentWorkflowId],
    queryFn: async () => {
      if (!currentWorkflowId) throw new Error("No workflow ID");
      const response = await fetch(
        `http://localhost:8000/workflow-status/${currentWorkflowId}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch workflow status");
      }
      const data: WorkflowStatus = await response.json();
      if (data.status === "completed") {
        resetWorkflow();
        toast.success("Workflow completed", {
          description: "Your workflow has finished running",
        });
      } else if (data.status === "failed") {
        resetWorkflow();
        toast.error("Workflow failed", {
          description:
            data.error || "An error occurred while running the workflow",
        });
      }
      return data;
    },
    enabled: !!currentWorkflowId && isRunning,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const { mutate: createWorkflow } = useMutation({
    mutationFn: async (body: any) => {
      const response = await fetch("http://localhost:8000/run-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...body, symbol: "pi_ethusd" }),
      });
      return response.json();
    },
    onError: (error) => {
      toast.error("Error creating workflow", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
    onSuccess: (data: { workflow_id: string }) => {
      setWorkflowId(data.workflow_id);
      toast.success("Workflow started", {
        description: `Workflow ID: ${data.workflow_id}`,
      });
    },
  });

  const profit = 0.25; // Example profit
  const royalties = profit * 0.1; // Example royalty calculation

  useEffect(() => {
    onRunningChange?.(isRunning);
  }, [isRunning, onRunningChange]);

  const handleStart = async () => {
    setShowStartDialog(true);
    await createWorkflow({
      workflow: {
        nodes: storage.nodes.map((node) => ({
          id: node.id,
          agent_id: node.data.agentId,
          type: node.type,
          position: node.position,
        })),
        edges: storage.edges,
      },
    });
  };

  const handleStop = () => {
    setShowStopDialog(true);
    resetWorkflow();
  };

  const confirmStart = () => {
    setIsRunning(true);
    setShowStartDialog(false);
    onStart?.();
  };

  const confirmStop = () => {
    setIsRunning(false);
    setShowStopDialog(false);
    onStop?.();
  };

  const filteredNodes = useMemo(() => {
    if (!nodeTypes) return [SYMBOL_NODE];
    if (!searchQuery.trim()) return [SYMBOL_NODE, ...nodeTypes];

    const query = searchQuery.toLowerCase();
    if (
      SYMBOL_NODE.label.toLowerCase().includes(query) ||
      SYMBOL_NODE.description.toLowerCase().includes(query)
    ) {
      return [
        SYMBOL_NODE,
        ...nodeTypes.filter(
          (node) =>
            node.label.toLowerCase().includes(query) ||
            node.description.toLowerCase().includes(query) ||
            node.type.toLowerCase().includes(query),
        ),
      ];
    }

    return nodeTypes.filter(
      (node) =>
        node.label.toLowerCase().includes(query) ||
        node.description.toLowerCase().includes(query) ||
        node.type.toLowerCase().includes(query),
    );
  }, [searchQuery, nodeTypes]);

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

  if (isLoading) {
    return (
      <div className={className}>
        <h2 className="text-lg font-semibold text-gray-200">
          Loading blocks...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <h2 className="text-lg font-semibold text-gray-200">
          Error loading blocks
        </h2>
        <p className="text-red-400 mt-2">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

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
        <ScrollArea className="h-[calc(100vh-150px)]">
          {/* Nodes list */}
          <div className="space-y-3">
            {filteredNodes?.map((node, index) => (
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
                  {getIcon(node.icon || "brain")}
                </div>
                <div>
                  <h3 className="font-medium text-gray-200">{node.label}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {node.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Start Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start Trading Agent</DialogTitle>
            <DialogDescription className="pt-3">
              This will cost{" "}
              <span className="font-semibold text-white">
                {initialCost} ETH
              </span>{" "}
              to run. Do you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowStartDialog(false)}>
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
                  <span className="text-2xl font-semibold text-white">
                    +{profit} ETH
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400">Royalties</span>
                  <span className="text-2xl font-semibold text-red-400">
                    -{royalties} ETH
                  </span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowStopDialog(false)}>
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
