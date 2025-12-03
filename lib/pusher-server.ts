import Pusher from "pusher";

// Singleton pattern to avoid multiple instances
const globalForPusher = globalThis as unknown as {
  pusherServer: Pusher | undefined;
};

export const pusherServer =
  globalForPusher.pusherServer ??
  new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    useTLS: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPusher.pusherServer = pusherServer;
}

// Event names constants
export const PUSHER_EVENTS = {
  NEW_MESSAGE: "new-message",
  MESSAGE_UPDATED: "message-updated",
  MESSAGE_DELETED: "message-deleted",
  MESSAGE_READ: "message-read",
  TYPING_START: "typing-start",
  TYPING_STOP: "typing-stop",
  USER_ONLINE: "user-online",
  USER_OFFLINE: "user-offline",
  CONVERSATION_UPDATED: "conversation-updated",
} as const;

// Channel name helpers
export const getConversationChannel = (conversationId: string) =>
  `private-conversation-${conversationId}`;

export const getUserChannel = (userId: string) => `private-user-${userId}`;

export const getPresenceChannel = (conversationId: string) =>
  `presence-conversation-${conversationId}`;
