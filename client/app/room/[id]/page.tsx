"use client";

import AIAgentNode from "@/components/AIAgentNode";
import { Cursor } from "@/components/Cursor";
import CustomEdge from "@/components/CustomEdge";
import { Navbar } from "@/components/Navbar";
import { ResultsSidebar } from "@/components/ResultsSidebar";
import { Sidebar } from "@/components/Sidebar";
import TradingNode from "@/components/TradingNode";
import { useStore } from "@/lib/store";
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
  MarkerType,
  Node,
  NodeChange,
  NodePositionChange,
  ReactFlow,
  useReactFlow,
  XYPosition,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";

const nodeTypes = new Proxy(
  {
    aiagent: AIAgentNode,
    trading: TradingNode,
  },
  {
    get: (target, prop) => {
      return target[prop as keyof typeof target] || AIAgentNode;
    },
  },
);

const initialNodes: LiveNode[] = [];
const initialEdges: LiveEdge[] = [];

const Home = () => {
  const params = useParams();
  const roomId = params.id as string;
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [sideBar, setSideBar] = useState(true);
  const { address } = useAccount();

  const storage = useStorage((root) => ({
    nodes: root.nodes ?? initialNodes,
    edges: root.edges ?? initialEdges,
  }));

  const getId = useCallback(() => {
    const highestId = Math.max(
      ...initialNodes.map((node) => parseInt(node.id)),
      ...storage.nodes.map((node) => parseInt(node.id)),
      0,
    );
    return String(highestId + 1);
  }, [storage.nodes]);

  const edgeTypes = useMemo(
    () => ({
      default: (props: any) => <CustomEdge {...props} isActive={isRunning} />,
    }),
    [isRunning],
  );

  const updateNodes = useMutation(({ storage }, nodes: LiveNode[]) => {
    storage.set("nodes", nodes);
  }, []);
  const updateEdges = useMutation(({ storage }, edges: LiveEdge[]) => {
    storage.set("edges", edges);
  }, []);

  const { screenToFlowPosition, getViewport } = useReactFlow();
  const [, updateMyPresence] = useMyPresence();
  const others = useOthers();

  useEffect(() => {
    useStore.setState({
      updateNodeData: (nodeId, newData) => {
        updateNodes(
          storage.nodes.map((node: any) => {
            if (node.id === nodeId) {
              return {
                ...node,
                data: newData,
              };
            }
            return node;
          }),
        );
      },
    });
  }, [storage.nodes, updateNodes]);

  useEffect(() => {
    updateMyPresence({
      walletAddress: address || null,
    });
  }, [address, updateMyPresence]);

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
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        markerEnd: {
          type: MarkerType.Arrow,
          width: 15,
          height: 15,
          color: "#3b82f6",
        },
        style: {
          strokeWidth: 2,
          stroke: "#3b82f6",
        },
        animated: false,
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
      const nodeData = JSON.parse(
        event.dataTransfer.getData("application/reactflow"),
      );

      if (!reactFlowBounds) return;

      const position = screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: LiveNode = {
        id: getId(),
        type: nodeData.type,
        position,
        data: {
          label: nodeData.data.label,
          description: nodeData.data.description,
          icon: nodeData.data.icon,
          agentId: nodeData.data.agentId,
        },
        agentId: nodeData.agentId,
        hash: nodeData.hash,
      };

      updateNodes([...storage.nodes, newNode]);
    },
    [screenToFlowPosition, storage.nodes, updateNodes, getId],
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
          walletAddress: address || null,
        });
      }
    },
    [getViewport, updateMyPresence, address],
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: LiveNode) => {
    setSelectedNode(node.id);
  }, []);

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const roundedPosition = {
        x: Math.round(node.position.x),
        y: Math.round(node.position.y),
      };

      updateNodes(
        storage.nodes.map((n) => {
          if (n.id === node.id) {
            return {
              ...n,
              position: roundedPosition,
            };
          }
          return n;
        }),
      );
    },
    [storage.nodes, updateNodes],
  );

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

  return (
    <div className="flex h-screen w-screen bg-gray-900">
      {sideBar && (
        <Sidebar
          className="w-80 h-full bg-gray-800 p-4 border-r border-gray-700"
          onRunningChange={setIsRunning}
        />
      )}
      <button
        onClick={() => setSideBar(!sideBar)}
        className={`
          absolute top-1/2 -translate-y-1/2 z-50
          bg-gray-800 hover:bg-gray-700
          border border-gray-700 hover:border-gray-600
          rounded-full p-2
          transition-all duration-300 ease-in-out
          ${sideBar ? "left-[20.5rem]" : "left-2"}
        `}
        title={sideBar ? "Collapse sidebar" : "Expand sidebar"}
      >
        {sideBar ? (
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
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
          onNodeDragStop={onNodeDragStop}
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
            style: {
              strokeWidth: 2,
              stroke: "#3b82f6",
            },
            markerEnd: {
              type: MarkerType.Arrow,
              width: 15,
              height: 15,
              color: "#3b82f6",
            },
          }}
          snapToGrid={true}
          snapGrid={[10, 10]}
          elevateNodesOnSelect={true}
          preventScrolling={true}
          nodesDraggable={true}
          nodesConnectable={true}
          selectNodesOnDrag={false}
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
                name={presence.walletAddress || "Anonymous User"}
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
                  edge.source === selectedNode || edge.target === selectedNode,
              );
              if (connectedEdges.length > 0) {
                updateEdges(
                  storage.edges.filter(
                    (edge) =>
                      edge.source !== selectedNode &&
                      edge.target !== selectedNode,
                  ),
                );
              }

              updateNodes(
                storage.nodes.filter((node) => node.id !== selectedNode),
              );
              setSelectedNode(null);
            }}
            title="Delete selected node (or press Delete/Backspace)"
          >
            <Trash2 className="w-6 h-6 text-red-400 group-hover:text-red-300 transition-colors duration-200" />
          </div>
        )}

        <ResultsSidebar />
      </div>
      <Navbar roomId={roomId} isFull={sideBar} />
    </div>
  );
};

export default Home;
