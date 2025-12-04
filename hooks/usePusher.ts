"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Channel } from "pusher-js";
import {
  getPusherClient,
  PUSHER_EVENTS,
  getConversationChannel,
  getUserChannel,
} from "@/lib/pusher-client";
import type { Message } from "@/types/chat";

interface UsePusherOptions {
  conversationId?: string;
  userId?: string;
  onNewMessage?: (message: Message) => void;
  onMessageUpdated?: (message: Message) => void;
  onMessageDeleted?: (data: {
    messageId: string;
    conversationId: string;
  }) => void;
  onMessageRead?: (data: {
    messageId: string;
    userId: string;
    readAt: string;
  }) => void;
  onTypingStart?: (data: { userId: string; userName: string }) => void;
  onTypingStop?: (data: { userId: string; userName: string }) => void;
  onUserOnline?: (data: { userId: string }) => void;
  onUserOffline?: (data: { userId: string }) => void;
}

export function usePusher({
  conversationId,
  userId,
  onNewMessage,
  onMessageUpdated,
  onMessageDeleted,
  onMessageRead,
  onTypingStart,
  onTypingStop,
}: UsePusherOptions) {
  const channelRef = useRef<Channel | null>(null);
  const userChannelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const pusher = getPusherClient();
    const channelName = getConversationChannel(conversationId);

    channelRef.current = pusher.subscribe(channelName);

    if (onNewMessage) {
      channelRef.current.bind(PUSHER_EVENTS.NEW_MESSAGE, onNewMessage);
    }
    if (onMessageUpdated) {
      channelRef.current.bind(PUSHER_EVENTS.MESSAGE_UPDATED, onMessageUpdated);
    }
    if (onMessageDeleted) {
      channelRef.current.bind(PUSHER_EVENTS.MESSAGE_DELETED, onMessageDeleted);
    }
    if (onMessageRead) {
      channelRef.current.bind(PUSHER_EVENTS.MESSAGE_READ, onMessageRead);
    }
    if (onTypingStart) {
      channelRef.current.bind(PUSHER_EVENTS.TYPING_START, onTypingStart);
    }
    if (onTypingStop) {
      channelRef.current.bind(PUSHER_EVENTS.TYPING_STOP, onTypingStop);
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        pusher.unsubscribe(channelName);
        channelRef.current = null;
      }
    };
  }, [
    conversationId,
    onNewMessage,
    onMessageUpdated,
    onMessageDeleted,
    onMessageRead,
    onTypingStart,
    onTypingStop,
  ]);

  useEffect(() => {
    if (!userId) return;

    const pusher = getPusherClient();
    const channelName = getUserChannel(userId);

    userChannelRef.current = pusher.subscribe(channelName);

    if (onNewMessage) {
      userChannelRef.current.bind(
        PUSHER_EVENTS.NEW_MESSAGE,
        (data: { conversationId: string; message: Message }) => {
          if (data.conversationId !== conversationId) {
            onNewMessage(data.message);
          }
        }
      );
    }

    return () => {
      if (userChannelRef.current) {
        userChannelRef.current.unbind_all();
        pusher.unsubscribe(channelName);
        userChannelRef.current = null;
      }
    };
  }, [userId, conversationId, onNewMessage]);

  return {
    channelRef,
    userChannelRef,
  };
}

export function useTypingIndicator(conversationId: string | undefined) {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const sendTypingIndicator = useCallback(
    async (isTyping: boolean) => {
      if (!conversationId) return;

      try {
        await fetch(`/api/chat/conversations/${conversationId}/typing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isTyping }),
        });
      } catch (error) {
        console.error("Failed to send typing indicator:", error);
      }
    },
    [conversationId]
  );

  const startTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTypingIndicator(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendTypingIndicator(false);
    }, 3000);
  }, [sendTypingIndicator]);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      sendTypingIndicator(false);
    }
  }, [sendTypingIndicator]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        sendTypingIndicator(false);
      }
    };
  }, [sendTypingIndicator]);

  return { startTyping, stopTyping };
}
