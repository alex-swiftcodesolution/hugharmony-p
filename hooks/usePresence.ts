"use client";

import { useEffect, useState, useRef } from "react";
import type { PresenceChannel, Members } from "pusher-js";
import { getPusherClient, getPresenceChannel } from "@/lib/pusher-client";

interface PresenceMember {
  id: string;
  info: {
    id: string;
    name: string;
    image?: string;
  };
}

interface UsePresenceOptions {
  conversationId: string | undefined;
}

export function usePresence({ conversationId }: UsePresenceOptions) {
  const [onlineUsers, setOnlineUsers] = useState<Map<string, PresenceMember>>(
    new Map()
  );
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<PresenceChannel | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const pusher = getPusherClient();
    const channelName = getPresenceChannel(conversationId);

    // Subscribe to presence channel
    channelRef.current = pusher.subscribe(channelName) as PresenceChannel;

    // Handle successful subscription
    channelRef.current.bind(
      "pusher:subscription_succeeded",
      (members: Members) => {
        setIsConnected(true);
        const users = new Map<string, PresenceMember>();
        members.each((member: PresenceMember) => {
          users.set(member.id, member);
        });
        setOnlineUsers(users);
      }
    );

    // Handle member added
    channelRef.current.bind("pusher:member_added", (member: PresenceMember) => {
      setOnlineUsers((prev) => {
        const updated = new Map(prev);
        updated.set(member.id, member);
        return updated;
      });
    });

    // Handle member removed
    channelRef.current.bind(
      "pusher:member_removed",
      (member: PresenceMember) => {
        setOnlineUsers((prev) => {
          const updated = new Map(prev);
          updated.delete(member.id);
          return updated;
        });
      }
    );

    // Handle subscription error
    channelRef.current.bind("pusher:subscription_error", (error: Error) => {
      console.error("Presence subscription error:", error);
      setIsConnected(false);
    });

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        pusher.unsubscribe(channelName);
        channelRef.current = null;
      }
      setOnlineUsers(new Map());
      setIsConnected(false);
    };
  }, [conversationId]);

  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.has(userId);
  };

  const getOnlineUserIds = (): string[] => {
    return Array.from(onlineUsers.keys());
  };

  return {
    onlineUsers,
    isConnected,
    isUserOnline,
    getOnlineUserIds,
    onlineCount: onlineUsers.size,
  };
}
