"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";

const initialStorage = {
  nodes: [
    {
      id: "1",
      position: { x: 100, y: 100 },
      data: { label: "Node 1", description: "Node 1" },
      type: "default",
    },
    {
      id: "2",
      position: { x: 300, y: 200 },
      data: { label: "Node 2", description: "Node 2" },
      type: "default",
    },
  ],
  edges: [{ id: "e1-2", source: "1", target: "2", type: "default" }],
};

const Room = ({ children }: { children: ReactNode }) => {
  return (
    <LiveblocksProvider
      publicApiKey={
        "pk_prod_hxsifK11dNff7o_wuiZQx9FH2z5jvTZmS09I6wFNacLK924Rwh0gvA1WL3s6mldT"
      }
    >
      <RoomProvider
        id="tartanhacks-flow-editor"
        initialPresence={{ cursor: null }}
        initialStorage={initialStorage}
      >
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
};

export default Room;
