"use client";

import { format, isToday, isYesterday } from "date-fns";
import { motion } from "motion/react";
import { ChatAvatar } from "./ChatAvatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";
import { getConversationName, getConversationAvatar } from "@/types/chat";

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  isActive: boolean;
  isOnline?: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  currentUserId,
  isActive,
  isOnline = false,
  onClick,
}: ConversationItemProps) {
  const name = getConversationName(conversation, currentUserId);
  const avatar = getConversationAvatar(conversation, currentUserId);
  const lastMessage = conversation.messages?.[0];
  const unreadCount = conversation.unreadCount || 0;

  const formatTime = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, "h:mm a");
    if (isYesterday(d)) return "Yesterday";
    return format(d, "MMM d");
  };

  const getLastMessagePreview = () => {
    if (!lastMessage) return "No messages yet";

    const isOwn = lastMessage.senderId === currentUserId;
    const prefix = isOwn ? "You: " : "";
    const content = lastMessage.isDeleted
      ? "Message deleted"
      : lastMessage.content;

    return `${prefix}${content}`;
  };

  return (
    <motion.div
      whileHover={{ backgroundColor: "hsl(var(--accent) / 0.5)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
        isActive && "bg-accent"
      )}
    >
      <ChatAvatar
        src={avatar}
        name={name}
        isOnline={isOnline}
        showOnlineStatus={!conversation.isGroup}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium text-sm truncate">{name}</h3>
          {lastMessage && (
            <span className="text-xs text-muted-foreground shrink-0">
              {formatTime(lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground truncate">
            {getLastMessagePreview()}
          </p>
          {unreadCount > 0 && (
            <Badge
              variant="default"
              className="h-5 min-w-5 px-1.5 text-[10px] font-semibold"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}
