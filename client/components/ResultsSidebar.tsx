"use client";

import { CheckCircle2, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useWorkflowStatus, NodeStatus } from "./WorkflowStatus";
import { useWorkflow } from "@/contexts/WorkflowContext";
import { useQuery } from "@tanstack/react-query";

type Status = "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED" | "FAILED";

interface NodeResult {
  status: NodeStatus;
  logs: string[];
}

interface WorkflowResults {
  [nodeId: string]: NodeResult;
}

const getStatusConfig = (status: Status) => {
  switch (status) {
    case "COMPLETED":
      return {
        icon: <CheckCircle2 className="h-3 w-3 text-green-400" />,
        color: "green",
        gradient: "from-green-500/10",
        textColor: "text-green-400",
        bgColor: "bg-green-500/10",
        dotColor: "bg-green-500/50",
      };
    case "IN_PROGRESS":
      return {
        icon: <Loader2 className="h-3 w-3 text-yellow-500 animate-spin" />,
        color: "yellow",
        gradient: "from-yellow-500/10",
        textColor: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        dotColor: "bg-yellow-500/50",
      };
    case "FAILED":
      return {
        icon: <AlertCircle className="h-3 w-3 text-red-400" />,
        color: "red",
        gradient: "from-red-500/10",
        textColor: "text-red-400",
        bgColor: "bg-red-500/10",
        dotColor: "bg-red-500/50",
      };
    case "NOT_STARTED":
    default:
      return {
        icon: <AlertCircle className="h-3 w-3 text-gray-400" />,
        color: "gray",
        gradient: "from-gray-500/10",
        textColor: "text-gray-400",
        bgColor: "bg-gray-500/10",
        dotColor: "bg-gray-500/50",
      };
  }
};

type TWorkflowStatus = {
  [key: string]: {
    status: string;
    logs: string[];
  };
};

export function ResultsSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentWorkflowId } = useWorkflow();
  const [called, setCalled] = useState(false);

  const {
    data: workflowStatus,
    isLoading,
    error,
  } = useQuery<TWorkflowStatus>({
    queryKey: ["workflow-status", currentWorkflowId],
    queryFn: async () => {
      if (!currentWorkflowId) throw new Error("No workflow ID");
      setCalled(true);
      const response = await fetch(
        `http://localhost:8000/workflow-status/${currentWorkflowId}`,
      );
      return response.json();
    },
    refetchInterval: 5000,
  });

  // Transform workflow status data into the format we need
  const results = workflowStatus || {};

  const getDisplayStatus = (status: NodeStatus): Status => {
    const lowerCaseStatus = status.toLowerCase();
    switch (lowerCaseStatus) {
      case "completed":
        return "COMPLETED";
      case "in_progress":
        return "IN_PROGRESS";
      case "not_started":
        return "NOT_STARTED";
      case "failed":
        return "FAILED";
      default:
        return "NOT_STARTED";
    }
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-[320px]"
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          absolute top-1/2 -translate-y-1/2 z-50
          bg-gray-800 hover:bg-gray-700
          border border-gray-700 hover:border-gray-600
          rounded-full p-2
          transition-all duration-300 ease-in-out
          -left-10
        `}
        title={isOpen ? "Close results" : "Open results"}
      >
        {isOpen ? (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        )}
      </button>

      <div className="w-80 h-full bg-gray-800 border-l border-gray-700 pt-[64px]">
        <div className="p-4 h-full overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">
            Execution Results
          </h2>

          {called && isLoading && (
            <div className="text-gray-400 text-sm">Loading results...</div>
          )}

          {error && (
            <div className="text-red-400 text-sm">
              Error loading results: {error.message}
            </div>
          )}

          <div className="space-y-4">
            {Object.entries(results).map(([nodeId, result]) => {
              const status = getDisplayStatus(result.status as NodeStatus);
              const config = getStatusConfig(status);
              return (
                <Card
                  key={nodeId}
                  className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800"
                >
                  <motion.div
                    className={`absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l ${config.gradient} to-transparent`}
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                  <div className="p-4 relative">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-100">
                        Node {nodeId}
                      </h3>
                      <div
                        className={`flex items-center gap-2 ${config.bgColor} px-3 py-1 rounded-full`}
                      >
                        {config.icon}
                        <span
                          className={`text-xs font-medium ${config.textColor}`}
                        >
                          {status}
                        </span>
                      </div>
                    </div>
                    {result.logs?.map((log, index) => (
                      <div key={index} className="flex items-center gap-3 mt-2">
                        <div
                          className={`h-2 w-2 rounded-full ${config.dotColor} ${
                            status === "IN_PROGRESS" ? "animate-pulse" : ""
                          }`}
                        />
                        <div className="text-sm text-gray-400">
                          <p>{log["log"]}</p>
                          <p className="text-xs text-gray-500">{log["timestamp"]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
