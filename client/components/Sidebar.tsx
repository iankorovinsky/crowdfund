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
import { TradingPair } from "./TradingNode";
import payRoyalty from "@/scripts/payRoyalty";

export interface NodeType {
  type: string;
  label: string;
  description: string;
  icon?: string;
  agentId: string;
  hash?: `0x${string}`;
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

export const SYMBOL_TO_KRAKEN_SYMBOL_MAPPING: Record<TradingPair, string> = {
  EUR: "PI_EURUSD",
  GBP: "PI_GBPUSD",
  BCH: "PI_BCHUSD",
  XRP: "PI_XRPUSD",
  USD: "PI_USDUSD",
  ETH: "PI_ETHUSD",
  USDT: "PI_USDTUSD",
  LTC: "PI_LTCUSD",
  USDC: "PI_USDCUSD",
  XBT: "PI_XBTUSD",
} as const;

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/agents`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch blocks");
      }
      const data = await response.json();
      return data.map((agent: any) => ({
        type: agent.type,
        label: agent.label,
        description: agent.description,
        icon: agent.icon,
        agentId: agent.id,
        hash: (agent.hash as `0x${string}`) || undefined,
      }));
    },
  });

  // Add workflow status polling
  const { data: workflowStatus } = useQuery({
    queryKey: ["workflow-status", currentWorkflowId],
    queryFn: async () => {
      if (!currentWorkflowId) throw new Error("No workflow ID");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/workflow-status/${currentWorkflowId}`,
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
    refetchInterval: 4000,
  });

  const { mutate: createWorkflow } = useMutation({
    mutationFn: async (body: any) => {
      const modifiedBody = { ...body };
      const symbolNode = storage.nodes.find((node) => node.type === "trading");

      if (symbolNode) {
        modifiedBody.symbol = symbolNode.data?.symbol
          ? SYMBOL_TO_KRAKEN_SYMBOL_MAPPING[
              symbolNode.data.symbol as TradingPair
            ]
          : "pi_ethusd";
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/run-workflow`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(modifiedBody),
        },
      );
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
  const number_of_blocks = storage.nodes?.length || 0;

  useEffect(() => {
    onRunningChange?.(isRunning);
  }, [isRunning, onRunningChange]);

  const handleStart = async () => {
    setShowStartDialog(true);
    await createWorkflow({
      workflow: {
        nodes: storage.nodes.map((node) => {
          return {
            id: node.id,
            agent_id: node.data.agentId,
            type: node.type,
            position: node.position,
            hash: node.hash,
          };
        }),
        edges: storage.edges,
      },
    });
    // go through all the nodes and pay royalty to the nodes
    for (const node of storage.nodes) {
      if (node.hash) {
        await payRoyalty(node.hash as `0x${string}`);
      }
    }
  };

  const handleStop = () => {
    setShowStopDialog(true);
    resetWorkflow();
  };

  const confirmStart = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/issue-tokens`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to issue tokens');
      }
      setIsRunning(true);
      setShowStartDialog(false);
      onStart?.();
    } catch (error) {
      toast.error('Failed to issue tokens', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
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
    const dragData = {
      ...nodeType,
      data: {
        label: nodeType.label,
        description: nodeType.description,
        icon: nodeType.icon || "brain",
        agentId: nodeType.agentId,
      },
      hash: nodeType.hash,
    };
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(dragData),
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
            <DialogTitle>Start Agent Workflow</DialogTitle>
            <DialogDescription className="pt-3">
              You will need to pay royalties on any profits generated by this
              workflow. The royalties will be distributed to the creators of the{" "}
              <span className="font-semibold text-white">
                {number_of_blocks} block{number_of_blocks !== 1 ? "s" : ""}
              </span>{" "}
              in your workflow. Do you want to proceed?
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
            <DialogTitle>Stop Agent Workflow</DialogTitle>
            <DialogDescription className="pt-3">
              10% of your earnings will be distributed as royalties to the
              creators of the blocks used in this workflow.
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
