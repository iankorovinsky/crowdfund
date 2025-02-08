import { BaseEdge, EdgeProps, getBezierPath } from "@xyflow/react";

interface CustomEdgeProps extends EdgeProps {
  isActive?: boolean;
}

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  isActive,
}: CustomEdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const activeStyle = isActive
    ? {
        stroke: "#3b82f6",
        strokeWidth: 2,
        filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))",
        transition: "all 0.3s ease-in-out",
      }
    : {
        stroke: "#3b82f680",
        strokeWidth: 1.5,
        transition: "all 0.3s ease-in-out",
      };

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        ...style,
        ...activeStyle,
      }}
      markerEnd={markerEnd}
    />
  );
} 