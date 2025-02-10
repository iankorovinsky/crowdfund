import { BaseUserMeta, createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

export type Presence = {
  cursor: { x: number; y: number; lastActive: number } | null;
  walletAddress: string | null;
};

export type NodeData = {
  label: string;
  description: string;
  agentId: string;
  icon?: string;
  tokenName?: string;
  supply?: string;
  issuance?: string;
  personality?: string;
  responses?: string;
  licenseTermsId?: string;
  path?: string;
  ipId?: string;
  symbol?: string;
};

export type LiveNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
  agentId: string;
  hash?: `0x${string}`;
};

export type LiveEdge = {
  id: string;
  source: string;
  target: string;
  type: string;
};

// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    Presence: {
      cursor: {
        x: number;
        y: number;
        lastActive: number;
      } | null;
      walletAddress: string | null;
    };

    Storage: {
      nodes: LiveNode[];
      edges: LiveEdge[];
    };

    // Custom events, for useBroadcastEvent, useEventListener
    RoomEvent: {};
    // Example has two events, using a union
    // | { type: "PLAY" }
    // | { type: "REACTION"; emoji: "🔥" };

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    ThreadMetadata: {
      // Example, attaching coordinates to a thread
      // x: number;
      // y: number;
    };

    // Custom room info set with resolveRoomsInfo, for useRoomInfo
    RoomInfo: {
      // Example, rooms with a title and url
      // title: string;
      // url: string;
    };
  }
}

// Storage represents the shared document that persists in the Room, even
// after all users leave. Fields under Storage typically are LiveList,
// LiveMap, LiveObject instances, for which updates are automatically
// persisted and synced to all connected users.
export type Storage = {
  nodes: LiveNode[];
  edges: LiveEdge[];
};

// UserMeta represents static/readonly metadata on each user, as opposed to
// Presence which is dynamic and can be updated. Accessible through the
// `user.info` property. Must be JSON-serializable.
export type UserMeta = BaseUserMeta;

// The type of custom events broadcasted and listened to in this room
export type RoomEvent = {};

const client = createClient({
  publicApiKey:
    "pk_prod_hxsifK11dNff7o_wuiZQx9FH2z5jvTZmS09I6wFNacLK924Rwh0gvA1WL3s6mldT",
});

export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    // useObject,
    // useMap,
    // useList,
    useBatch,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client);

export {};
