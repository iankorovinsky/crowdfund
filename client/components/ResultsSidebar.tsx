"use client"

import { CheckCircle2, Loader2, AlertCircle, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

type Status = "COMPLETED" | "IN PROGRESS" | "NOT STARTED";

interface NodeResult {
  status: Status;
  logs: string[];
}

interface ResultsSidebarProps {
  results: Record<string, NodeResult>;
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
        dotColor: "bg-green-500/50"
      };
    case "IN PROGRESS":
      return {
        icon: <Loader2 className="h-3 w-3 text-yellow-500 animate-spin" />,
        color: "yellow",
        gradient: "from-yellow-500/10",
        textColor: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        dotColor: "bg-yellow-500/50"
      };
    case "NOT STARTED":
      return {
        icon: <AlertCircle className="h-3 w-3 text-gray-400" />,
        color: "gray",
        gradient: "from-gray-500/10",
        textColor: "text-gray-400",
        bgColor: "bg-gray-500/10",
        dotColor: "bg-gray-500/50"
      };
  }
};

export function ResultsSidebar({ results }: ResultsSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`fixed right-0 top-0 h-full transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-[320px]"
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-6 top-1/2 -translate-y-1/2 bg-gray-800 border-2 border-r-0 border-gray-700 rounded-l-lg py-3 px-1 hover:bg-gray-700 transition-colors duration-200 z-50"
        title={isOpen ? "Close results" : "Open results"}
      >
        <ChevronRight
          className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${
            !isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div className="w-80 h-full bg-gray-800 border-l border-gray-700 pt-[64px]">
        <div className="p-4 h-full overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">
            Execution Results
          </h2>

          <div className="space-y-4">
            {Object.entries(results).map(([nodeId, result]) => {
              const config = getStatusConfig(result.status);
              return (
                <Card key={nodeId} className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800">
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
                        Node {nodeId.replace('node', '')}
                      </h3>
                      <div className={`flex items-center gap-2 ${config.bgColor} px-3 py-1 rounded-full`}>
                        {config.icon}
                        <span className={`text-xs font-medium ${config.textColor}`}>
                          {result.status}
                        </span>
                      </div>
                    </div>
                    {result.logs.map((log, index) => (
                      <div key={index} className="flex items-center gap-3 mt-2">
                        <div className={`h-2 w-2 rounded-full ${config.dotColor} ${
                          result.status === "IN PROGRESS" ? "animate-pulse" : ""
                        }`} />
                        <p className="text-sm text-gray-400">{log}</p>
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
