import React, { createContext, useContext, useState, ReactNode } from "react";

interface WorkflowContextType {
  currentWorkflowId: string | null;
  isRunning: boolean;
  setWorkflowId: (id: string | null) => void;
  setIsRunning: (isRunning: boolean) => void;
  resetWorkflow: () => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(
  undefined,
);

interface WorkflowProviderProps {
  children: ReactNode;
}

export function WorkflowProvider({ children }: WorkflowProviderProps) {
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(
    null,
  );
  const [isRunning, setIsRunning] = useState(false);

  const setWorkflowId = (id: string | null) => setCurrentWorkflowId(id);

  const resetWorkflow = () => {
    setCurrentWorkflowId(null);
    setIsRunning(false);
  };

  return (
    <WorkflowContext.Provider
      value={{
        currentWorkflowId,
        isRunning,
        setWorkflowId,
        setIsRunning,
        resetWorkflow,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  }
  return context;
}
