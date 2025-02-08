import { ChevronRight } from "lucide-react";
import { useState } from "react";

interface NodeResult {
  status: "COMPLETED" | "IN PROGRESS" | "NOT STARTED";
  logs: string[];
}

interface ResultsSidebarProps {
  results: Record<string, NodeResult>;
}

const statusColors = {
  COMPLETED: "text-green-400",
  "IN PROGRESS": "text-yellow-400",
  "NOT STARTED": "text-gray-400",
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

      <div className="w-80 h-full bg-gray-800 border-l border-gray-700">
        <div className="p-4 h-full overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">
            Agent Results
          </h2>

          <div className="space-y-4">
            {Object.entries(results).map(([nodeId, result]) => (
              <div key={nodeId} className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-300">{nodeId}</h3>
                  <span className={`text-sm ${statusColors[result.status]}`}>
                    {result.status}
                  </span>
                </div>

                {result.logs.length > 0 && (
                  <div className="space-y-1">
                    {result.logs.map((log, index) => (
                      <p key={index} className="text-sm text-gray-400">
                        {log}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
