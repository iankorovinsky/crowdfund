"use client";

import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  BackgroundVariant,
  useReactFlow,
  Node,
  Edge,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useRef } from "react";
import { Sidebar, NodeType } from "@/components/Sidebar";
import { CursorPresence } from "@/components/CursorPresence";

interface CustomNode extends Node {
  data: {
    label: string;
  };
}

interface CustomEdge extends Edge {
  type: string;
}

const initialNodes: CustomNode[] = [
  {
    id: "1",
    position: { x: 100, y: 100 },
    data: { label: "Node 1" },
    type: "default",
  },
  {
    id: "2",
    position: { x: 300, y: 200 },
    data: { label: "Node 2" },
    type: "default",
  },
];

const initialEdges: CustomEdge[] = [
  { id: "e1-2", source: "1", target: "2", type: "default" },
];

let id = 0;
const getId = () => `dnd-${id++}`;

function Flow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => {
      const edge: CustomEdge = {
        id: `e${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        type: "default",
      };
      setEdges((eds) => [...eds, edge]);
    },
    [setEdges]
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

      const newNode: CustomNode = {
        id: getId(),
        type: nodeType.type,
        position,
        data: { label: nodeType.label },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes]
  );

  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
      <div ref={reactFlowWrapper} className="flex-1 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
          <CursorPresence />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
