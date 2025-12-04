"use client";

import { useEffect, useRef } from "react";
import type { PresenceChannel, Members } from "pusher-js";
import { getPusherClient } from "@/lib/pusher-client";
import { useChatStore } from "@/stores/chat-store";

interface PresenceMember {
  id: string;
  info: {
    id: string;
    name: string;
    image?: string;
  };
}

export function useGlobalPresence(userId: string | undefined) {
  const channelRef = useRef<PresenceChannel | null>(null);
  const { setOnlineUsers, setUserOnline, setUserOffline } = useChatStore();

  useEffect(() => {
    if (!userId) return;

    const pusher = getPusherClient();

    // Subscribe to global presence channel
    channelRef.current = pusher.subscribe("presence-global") as PresenceChannel;

    // Handle successful subscription - get initial list of online users
    channelRef.current.bind(
      "pusher:subscription_succeeded",
      (members: Members) => {
        const onlineUserIds: string[] = [];
        members.each((member: PresenceMember) => {
          onlineUserIds.push(member.id);
        });
        setOnlineUsers(onlineUserIds);
        console.log("Initial online users:", onlineUserIds);
      }
    );

    // Handle member added (user came online)
    channelRef.current.bind("pusher:member_added", (member: PresenceMember) => {
      console.log("User came online:", member.id);
      setUserOnline(member.id);
    });

    // Handle member removed (user went offline)
    channelRef.current.bind(
      "pusher:member_removed",
      (member: PresenceMember) => {
        console.log("User went offline:", member.id);
        setUserOffline(member.id);
      }
    );

    // Handle subscription error
    channelRef.current.bind("pusher:subscription_error", (error: Error) => {
      console.error("Global presence subscription error:", error);
    });

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        pusher.unsubscribe("presence-global");
        channelRef.current = null;
      }
    };
  }, [userId, setOnlineUsers, setUserOnline, setUserOffline]);

  return null;
}
