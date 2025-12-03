import PusherClient from "pusher-js";

// Singleton pattern for client
let pusherClientInstance: PusherClient | null = null;

export const getPusherClient = (): PusherClient => {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        authEndpoint: "/api/chat/pusher/auth",
        authTransport: "ajax",
        auth: {
          headers: {
            "Content-Type": "application/json",
          },
        },
      }
    );

    // Enable logging in development
    if (process.env.NODE_ENV === "development") {
      PusherClient.logToConsole = true;
    }
  }

  return pusherClientInstance;
};

// Event names (shared with server)
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
