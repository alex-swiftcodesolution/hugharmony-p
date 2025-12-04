import { create } from "zustand";
import type { Conversation, Message } from "@/types/chat";

interface TypingUser {
  userId: string;
  userName: string;
}

interface ChatState {
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoadingConversations: boolean;

  // Messages
  messages: Message[];
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
  nextCursor: string | null;

  // Typing indicators
  typingUsers: Map<string, TypingUser[]>; // conversationId -> users typing

  // Online status
  onlineUsers: Set<string>;

  // Actions - Conversations
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (
    conversationId: string,
    updates: Partial<Conversation>
  ) => void;
  setActiveConversation: (conversationId: string | null) => void;
  setLoadingConversations: (loading: boolean) => void;
  incrementUnreadCount: (conversationId: string) => void;
  resetUnreadCount: (conversationId: string) => void;

  // Actions - Messages
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  removeMessage: (messageId: string) => void;
  prependMessages: (messages: Message[]) => void;
  setLoadingMessages: (loading: boolean) => void;
  setPagination: (hasMore: boolean, cursor: string | null) => void;
  clearMessages: () => void;

  // Actions - Typing
  addTypingUser: (conversationId: string, user: TypingUser) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;

  // Actions - Online
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  setOnlineUsers: (userIds: string[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  // Initial state
  conversations: [],
  activeConversationId: null,
  isLoadingConversations: false,
  messages: [],
  isLoadingMessages: false,
  hasMoreMessages: false,
  nextCursor: null,
  typingUsers: new Map(),
  onlineUsers: new Set(),

  // Conversation actions
  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [
        conversation,
        ...state.conversations.filter((c) => c.id !== conversation.id),
      ],
    })),

  updateConversation: (conversationId, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, ...updates } : c
      ),
    })),

  setActiveConversation: (conversationId) =>
    set({ activeConversationId: conversationId }),

  setLoadingConversations: (loading) =>
    set({ isLoadingConversations: loading }),

  incrementUnreadCount: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, unreadCount: (c.unreadCount || 0) + 1 }
          : c
      ),
    })),

  resetUnreadCount: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    })),

  // Message actions
  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => {
      // Avoid duplicates
      if (state.messages.some((m) => m.id === message.id)) {
        return state;
      }
      return { messages: [...state.messages, message] };
    }),

  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, ...updates } : m
      ),
    })),

  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== messageId),
    })),

  prependMessages: (messages) =>
    set((state) => ({
      messages: [...messages, ...state.messages],
    })),

  setLoadingMessages: (loading) => set({ isLoadingMessages: loading }),

  setPagination: (hasMore, cursor) =>
    set({ hasMoreMessages: hasMore, nextCursor: cursor }),

  clearMessages: () =>
    set({ messages: [], hasMoreMessages: false, nextCursor: null }),

  // Typing actions
  addTypingUser: (conversationId, user) =>
    set((state) => {
      const newTypingUsers = new Map(state.typingUsers);
      const existing = newTypingUsers.get(conversationId) || [];
      if (!existing.some((u) => u.userId === user.userId)) {
        newTypingUsers.set(conversationId, [...existing, user]);
      }
      return { typingUsers: newTypingUsers };
    }),

  removeTypingUser: (conversationId, userId) =>
    set((state) => {
      const newTypingUsers = new Map(state.typingUsers);
      const existing = newTypingUsers.get(conversationId) || [];
      newTypingUsers.set(
        conversationId,
        existing.filter((u) => u.userId !== userId)
      );
      return { typingUsers: newTypingUsers };
    }),

  // Online actions
  setUserOnline: (userId) =>
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.add(userId);
      return { onlineUsers: newOnlineUsers };
    }),

  setUserOffline: (userId) =>
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.delete(userId);
      return { onlineUsers: newOnlineUsers };
    }),

  setOnlineUsers: (userIds) => set({ onlineUsers: new Set(userIds) }),
}));
