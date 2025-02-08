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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useRef } from "react";
import AIAgentNode from "@/components/AIAgentNode";

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

let id = 0;
const getId = () => `dnd-${id++}`;

const Home = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
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
        (change): change is NodePositionChange => change.type === "position"
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
          })
        );
      }
    },
    [storage.nodes, updateNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const removeChange = changes.find(
        (change): change is EdgeRemoveChange => change.type === "remove"
      );
      if (removeChange) {
        updateEdges(
          storage.edges.filter((edge) => edge.id !== removeChange.id)
        );
      }
    },
    [storage.edges, updateEdges]
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
    [storage.edges, updateEdges]
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
        event.dataTransfer.getData("application/reactflow")
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
    [screenToFlowPosition, storage.nodes, updateNodes]
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
    [getViewport, updateMyPresence]
  );

  console.log("nodes", storage.nodes);
  console.log("edges", storage.edges);

  console.log(
    JSON.stringify(
      {
        nodes: storage.nodes,
        edges: storage.edges,
      },
      null,
      2
    )
  );

  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
      <div ref={reactFlowWrapper} className="flex-1 h-full">
        <ReactFlow
          nodes={storage.nodes}
          edges={storage.edges}
          nodeTypes={nodeTypes}
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
          onMouseLeave={() => {
            updateMyPresence({
              cursor: null,
            });
          }}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
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
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ReactFlowProvider>
      <Home />
    </ReactFlowProvider>
  );
}
