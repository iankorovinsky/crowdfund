import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

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

// Presence represents the properties that exist on every user in the Room
// and that will automatically be kept in sync. Accessible through the
// `user.presence` property. Must be JSON-serializable.
export type Presence = {
  cursor: {
    x: number;
    y: number;
    lastActive: number;
  } | null;
};

// Storage represents the shared document that persists in the Room, even
// after all users leave. Fields under Storage typically are LiveList,
// LiveMap, LiveObject instances, for which updates are automatically
// persisted and synced to all connected users.
export type Storage = {
  // Add your storage fields here
};

// UserMeta represents static/readonly metadata on each user, as opposed to
// Presence which is dynamic and can be updated. Accessible through the
// `user.info` property. Must be JSON-serializable.
export type UserMeta = {
  id: string; // Required by liveblocks
  name?: string;
};

// The type of custom events broadcasted and listened to in this room
// export type RoomEvent = {};

const client = createClient({
  publicApiKey:
    process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY ||
    "pk_prod_hxsifK11dNff7o_wuiZQx9FH2z5jvTZmS09I6wFNacLK924Rwh0gvA1WL3s6mldT",
});

export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useOthers,
    useOthersMapped,
    useOther,
    useSelf,
    useStorage,
    useMutation,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useBatch,
    useStatus,
  },
} = createRoomContext<Presence, Storage, UserMeta>(client);

export {};
