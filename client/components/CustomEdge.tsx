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
        stroke: "url(#activeGradient)",
        strokeWidth: 5,
        filter: "drop-shadow(0 0 10px rgba(59, 130, 246, 0.6))",
        transition: "all 0.3s ease-in-out",
      }
    : {
        stroke: "url(#inactiveGradient)",
        strokeWidth: 4,
        transition: "all 0.3s ease-in-out",
      };

  return (
    <>
      <defs>
        <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
          <animate
            attributeName="x1"
            values="0%;100%;0%"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            values="100%;200%;100%"
            dur="3s"
            repeatCount="indefinite"
          />
        </linearGradient>
        <linearGradient id="inactiveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
          <stop offset="50%" stopColor="rgba(96, 165, 250, 0.4)" />
          <stop offset="100%" stopColor="rgba(59, 130, 246, 0.4)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          ...activeStyle,
        }}
        markerEnd={markerEnd}
      />
      {isActive && (
        <circle r="4" fill="#60a5fa" filter="url(#glow)">
          <animateMotion
            path={edgePath}
            dur="1.5s"
            repeatCount="indefinite"
            rotate="auto"
          />
        </circle>
      )}
    </>
  );
}
