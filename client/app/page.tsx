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
  XYPosition
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useRef } from "react";

const initialNodes: LiveNode[] = [
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
        type: nodeType.type,
        position,
        data: { label: nodeType.label },
      };

      updateNodes([...storage.nodes, newNode]);
    },
    [screenToFlowPosition, storage.nodes, updateNodes]
  );

  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
      <div ref={reactFlowWrapper} className="flex-1 h-full">
        <ReactFlow
          nodes={storage.nodes}
          edges={storage.edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onMouseMove={(e) => {
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

export default Home;
