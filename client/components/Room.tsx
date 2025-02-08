"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";

const initialStorage = {
  "nodes": [
    {
      "id": "f4309be3-fcc0-47d0-a793-a4d95c989263",
      "type": "aiagent",
      "position": {
        "x": 100,
        "y": 200
      },
      "data": {
        "label": "Node 1",
        "description": "Node 1 does something"
      }
    },
    {
      "id": "0e5651cd-c772-4fa6-928d-0f74287cd61c",
      "type": "aiagent",
      "position": {
        "x": 300,
        "y": 200
      },
      "data": {
        "label": "Node 2",
        "description": "Node 2 does something"
      }
    },
    {
      "id": "0fc901ed-88c0-4dc1-b978-2f0edb0918cd",
      "type": "aiagent",
      "position": {
        "x": 500,
        "y": 200
      },
      "data": {
        "label": "Node 3",
        "description": "Node 3 does something"
      }
    },
    {
      "id": "62c1a9c0-ec16-448c-9407-38cbaaaaf214",
      "type": "aiagent",
      "position": {
        "x": 700,
        "y": 200
      },
      "data": {
        "label": "Node 4",
        "description": "Node 4 does something"
      }
    }
  ],
  "edges": [
    {
      "id": "edge1",
      "source": "f4309be3-fcc0-47d0-a793-a4d95c989263",
      "target": "0e5651cd-c772-4fa6-928d-0f74287cd61c",
      "type": "default"
    },
    {
      "id": "edge2",
      "source": "0e5651cd-c772-4fa6-928d-0f74287cd61c",
      "target": "0fc901ed-88c0-4dc1-b978-2f0edb0918cd",
      "type": "default"
    },
    {
      "id": "edge3",
      "source": "0fc901ed-88c0-4dc1-b978-2f0edb0918cd",
      "target": "62c1a9c0-ec16-448c-9407-38cbaaaaf214",
      "type": "default"
    }
  ]
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
