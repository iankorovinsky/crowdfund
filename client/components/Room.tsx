"use client";

import React, { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";

const initialStorage = {
  nodes: [],
  edges: [],
};

interface RoomProps {
  children: ReactNode;
  roomId?: string;
}

const Room = ({ children, roomId }: RoomProps) => {
  return (
    <LiveblocksProvider
      publicApiKey={
        "pk_prod_hxsifK11dNff7o_wuiZQx9FH2z5jvTZmS09I6wFNacLK924Rwh0gvA1WL3s6mldT"
      }
    >
      <RoomProvider
        id={roomId || "tartanhacks-flow-editor"}
        initialPresence={{
          cursor: null,
          walletAddress: null,
        }}
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
