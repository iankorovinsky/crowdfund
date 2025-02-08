"use client";

import { useEffect, useState } from "react";
import { useReactFlow } from "@xyflow/react";

interface CursorProps {
  x: number;
  y: number;
  lastActive?: number;
  name: string;
}

export function Cursor({ x, y, lastActive, name }: CursorProps) {
  const { getViewport } = useReactFlow();
  const [isVisible, setIsVisible] = useState(true);

  const { zoom, x: vpX, y: vpY } = getViewport();
  const screenX = x * zoom + vpX;
  const screenY = y * zoom + vpY;

  useEffect(() => {
    const checkActivity = () => {
      if (!lastActive) return;
      const timeSinceActive = Date.now() - lastActive;
      setIsVisible(timeSinceActive < 2000);
    };

    checkActivity();
    const interval = setInterval(checkActivity, 100);
    return () => clearInterval(interval);
  }, [lastActive]);

  if (!isVisible) return null;

  return (
    <div
      className="pointer-events-none absolute w-4 h-4 transition-transform duration-100 z-[9999]"
      style={{
        transform: `translate(${screenX}px, ${screenY}px)`,
        willChange: "transform",
      }}
    >
      <svg
        className="absolute top-0 left-0"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill="#FF0000"
          stroke="white"
        />
      </svg>
      <div
        className="absolute left-4 -top-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap transition-opacity duration-200"
        style={{
          opacity: isVisible ? 1 : 0,
        }}
      >
        {name}
      </div>
    </div>
  );
}
