"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import { useMyPresence, useOthers } from "@liveblocks/react/suspense";
import { Cursor } from "./Cursor";

export function CursorPresence() {
  const { getViewport } = useReactFlow();
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const flowRef = useRef<HTMLDivElement>(null);

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      event.preventDefault();

      if (flowRef.current) {
        const bounds = flowRef.current.getBoundingClientRect();
        const { zoom, x: vpX, y: vpY } = getViewport();

        const flowX = (event.clientX - bounds.left - vpX) / zoom;
        const flowY = (event.clientY - bounds.top - vpY) / zoom;

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

  const onPointerLeave = useCallback(() => {
    updateMyPresence({
      cursor: null,
    });
  }, [updateMyPresence]);

  useEffect(() => {
    const reactFlowWrapper = document.querySelector(".react-flow");
    if (!reactFlowWrapper) return;

    reactFlowWrapper.addEventListener(
      "pointermove",
      onPointerMove as EventListener
    );
    reactFlowWrapper.addEventListener(
      "pointerleave",
      onPointerLeave as EventListener
    );

    return () => {
      reactFlowWrapper.removeEventListener(
        "pointermove",
        onPointerMove as EventListener
      );
      reactFlowWrapper.removeEventListener(
        "pointerleave",
        onPointerLeave as EventListener
      );
    };
  }, [onPointerMove, onPointerLeave]);

  return (
    <div ref={flowRef} className="w-full h-full">
      {others.map(({ connectionId, presence, info }) => {
        if (!presence?.cursor) return null;

        return (
          <Cursor
            key={connectionId}
            x={presence.cursor.x}
            y={presence.cursor.y}
            lastActive={presence.cursor.lastActive}
            name={info?.name || `User ${connectionId}`}
          />
        );
      })}
    </div>
  );
}
