"use client";

import { Cursor } from "@/components/Cursor";
import { NodeType, Sidebar } from "@/components/Sidebar";
import { LiveEdge, LiveNode } from "@/liveblocks.config";
import {
  useMutation,
  useMyPresence,
  useOthers,
  useStorage,
} from "@liveblocks/react/suspense";
import {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  EdgeChange,
  EdgeRemoveChange,
  NodeChange,
  NodePositionChange,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  XYPosition,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import AIAgentNode from "@/components/AIAgentNode";
import { Trash2, Copy } from "lucide-react";
import { ResultsSidebar } from "@/components/ResultsSidebar";
import { useParams } from "next/navigation";
import { UploadAgent } from "@/components/UploadAgent";
import CustomEdge from "@/components/CustomEdge";
import { Navbar } from "@/components/Navbar";

const nodeTypes = {
  aiagent: AIAgentNode,
};

const initialNodes: LiveNode[] = [
  {
    id: "1",
    type: "aiagent",
    position: { x: 100, y: 100 },
    data: {
      label: "Market Analysis",
      description: "Analyzes market conditions and trends",
    },
  },
  {
    id: "2",
    type: "aiagent",
    position: { x: 400, y: 100 },
    data: {
      label: "Decision Maker",
      description: "Makes final trading decisions",
    },
  },
];

const initialEdges: LiveEdge[] = [
  { id: "e1-2", source: "1", target: "2", type: "default" },
];

let nextId = Math.max(...initialNodes.map((node) => parseInt(node.id)), 0) + 1;
const getId = () => String(nextId++);

const exampleResults = {
  node1: {
    status: "COMPLETED" as const,
    logs: ["Completed analysis"],
  },
  node2: {
    status: "IN PROGRESS" as const,
    logs: ["Calculating trade"],
  },
  node3: {
    status: "NOT STARTED" as const,
    logs: [],
  },
};

const Home = () => {
  const params = useParams();
  const roomId = params.id as string;
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const edgeTypes = useMemo(() => ({
    default: (props: any) => <CustomEdge {...props} isActive={isRunning} />,
  }), [isRunning]);

  const storage = useStorage((root) => ({
    nodes: root.nodes ?? initialNodes,
    edges: root.edges ?? initialEdges,
  }));
  const updateNodes = useMutation(({ storage }, nodes: LiveNode[]) => {
    storage.set("nodes", nodes);
  }, []);
  const updateEdges = useMutation(({ storage }, edges: LiveEdge[]) => {
    storage.set("edges", edges);
  }, []);

  const { screenToFlowPosition, getViewport } = useReactFlow();
  const [, updateMyPresence] = useMyPresence();
  const others = useOthers();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const positionChange = changes.find(
        (change): change is NodePositionChange => change.type === "position",
      );
      if (positionChange && positionChange.position) {
        updateNodes(
          storage.nodes.map((node) => {
            if (node.id === positionChange.id) {
              return {
                ...node,
                position: positionChange.position as XYPosition,
              };
            }
            return node;
          }),
        );
      }
    },
    [storage.nodes, updateNodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const removeChange = changes.find(
        (change): change is EdgeRemoveChange => change.type === "remove",
      );
      if (removeChange) {
        updateEdges(
          storage.edges.filter((edge) => edge.id !== removeChange.id),
        );
      }
    },
    [storage.edges, updateEdges],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;
      const edge: LiveEdge = {
        id: `e${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        type: "default",
      };
      updateEdges([...storage.edges, edge]);
    },
    [storage.edges, updateEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const nodeType = JSON.parse(
        event.dataTransfer.getData("application/reactflow"),
      ) as NodeType;

      if (!reactFlowBounds) return;

      const position = screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: LiveNode = {
        id: getId(),
        type: "aiagent",
        position,
        data: {
          label: nodeType.label,
          description: nodeType.description,
        },
      };

      updateNodes([...storage.nodes, newNode]);
    },
    [screenToFlowPosition, storage.nodes, updateNodes],
  );

  const updateCursorPosition = useCallback(
    (e: { clientX: number; clientY: number }) => {
      if (reactFlowWrapper.current) {
        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        const { zoom, x: vpX, y: vpY } = getViewport();

        const flowX = (e.clientX - bounds.left - vpX) / zoom;
        const flowY = (e.clientY - bounds.top - vpY) / zoom;

        updateMyPresence({
          cursor: {
            x: flowX,
            y: flowY,
            lastActive: Date.now(),
          },
        });
      }
    },
    [getViewport, updateMyPresence],
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: LiveNode) => {
    setSelectedNode(node.id);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        selectedNode &&
        (event.key === "Backspace" || event.key === "Delete")
      ) {
        // Also remove any connected edges
        const connectedEdges = storage.edges.filter(
          (edge) =>
            edge.source === selectedNode || edge.target === selectedNode,
        );
        if (connectedEdges.length > 0) {
          updateEdges(
            storage.edges.filter(
              (edge) =>
                edge.source !== selectedNode && edge.target !== selectedNode,
            ),
          );
        }

        updateNodes(storage.nodes.filter((node) => node.id !== selectedNode));
        setSelectedNode(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedNode, storage.nodes, storage.edges, updateNodes, updateEdges]);

  console.log("nodes", storage.nodes);
  console.log("edges", storage.edges);

  console.log(
    JSON.stringify(
      {
        nodes: storage.nodes,
        edges: storage.edges,
      },
      null,
      2,
    ),
  );

  return (
    <div className="flex h-screen w-screen bg-gray-900">
      <Sidebar 
        className="w-80 h-full bg-gray-800 p-4 border-r border-gray-700" 
        onRunningChange={setIsRunning}
      />
      <div ref={reactFlowWrapper} className="flex-1 h-full relative">
        <ReactFlow
          nodes={storage.nodes}
          edges={storage.edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onMouseMove={updateCursorPosition}
          onNodeDrag={(e) => {
            if (e.clientX && e.clientY) {
              updateCursorPosition(e);
            }
          }}
          onNodeClick={onNodeClick}
          onPaneClick={() => setSelectedNode(null)}
          onMouseLeave={() => {
            updateMyPresence({
              cursor: null,
            });
          }}
          fitView
          className="bg-gray-900"
          defaultEdgeOptions={{
            type: "default",
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={12}
            size={1}
            color="#4B5563"
          />
          <Controls className="bg-gray-800 border-gray-700 fill-gray-400 [&>button]:border-gray-700 [&>button]:bg-gray-800" />
          {others.map(({ connectionId, presence }) => {
            if (!presence.cursor) return null;
            return (
              <Cursor
                key={connectionId}
                x={presence.cursor.x}
                y={presence.cursor.y}
                lastActive={presence.cursor.lastActive}
                name={`User ${connectionId}`}
              />
            );
          })}
        </ReactFlow>

        {/* Trash Bin */}
        {selectedNode && (
          <div
            className="absolute bottom-8 right-8 p-4 bg-gray-800 rounded-full shadow-lg border-2 border-red-900/50 cursor-pointer hover:bg-gray-700 transition-all duration-200 group"
            onClick={() => {
              const connectedEdges = storage.edges.filter(
                (edge) =>
                  edge.source === selectedNode || edge.target === selectedNode
              );
              if (connectedEdges.length > 0) {
                updateEdges(
                  storage.edges.filter(
                    (edge) =>
                      edge.source !== selectedNode &&
                      edge.target !== selectedNode
                  )
                );
              }

              updateNodes(
                storage.nodes.filter((node) => node.id !== selectedNode)
              );
              setSelectedNode(null);
            }}
            title="Delete selected node (or press Delete/Backspace)"
          >
            <Trash2 className="w-6 h-6 text-red-400 group-hover:text-red-300 transition-colors duration-200" />
          </div>
        )}

        <ResultsSidebar results={exampleResults} />
      </div>
      <Navbar roomId={roomId} />
    </div>
  );
};

export default Home;

// DATA (fetches the data), FINANCIAL ANALYSIS, PORTFOLIO MANAGER (decider), PERSONALITY
