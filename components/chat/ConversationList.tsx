"use client";

import { AnimatePresence, motion } from "motion/react";
import { MessageSquare } from "lucide-react";
import { ConversationItem } from "./ConversationItem";
import { Skeleton } from "@/components/ui/skeleton";
import type { Conversation } from "@/types/chat";

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  activeConversationId: string | null;
  onlineUsers: Set<string>;
  isLoading?: boolean;
  onSelectConversation: (conversationId: string) => void;
}

export function ConversationList({
  conversations,
  currentUserId,
  activeConversationId,
  onlineUsers,
  isLoading = false,
  onSelectConversation,
}: ConversationListProps) {
  const isUserOnline = (conversation: Conversation) => {
    if (conversation.isGroup) return false;
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== currentUserId
    );
    return otherParticipant ? onlineUsers.has(otherParticipant.userId) : false;
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground">No conversations yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Start a new chat to begin messaging
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      <AnimatePresence>
        {conversations.map((conversation) => (
          <motion.div
            key={conversation.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            layout
          >
            <ConversationItem
              conversation={conversation}
              currentUserId={currentUserId}
              isActive={conversation.id === activeConversationId}
              isOnline={isUserOnline(conversation)}
              onClick={() => onSelectConversation(conversation.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
