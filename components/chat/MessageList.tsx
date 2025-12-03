"use client";

import { useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { useChatStore } from "@/stores/chat-store";
import type { Message } from "@/types/chat";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  typingUsers?: { userId: string; userName: string }[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onEditMessage?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

export function MessageList({
  messages,
  currentUserId,
  typingUsers = [],
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onEditMessage,
  onDeleteMessage,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Infinite scroll - load more when scrolling to top
  const topElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore?.();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasMore, onLoadMore]
  );

  // Group messages by sender for cleaner UI
  const shouldShowAvatar = (index: number) => {
    if (index === 0) return true;
    const currentMessage = messages[index];
    const previousMessage = messages[index - 1];
    return currentMessage.senderId !== previousMessage.senderId;
  };

  const isLastInGroup = (index: number) => {
    if (index === messages.length - 1) return true;
    const currentMessage = messages[index];
    const nextMessage = messages[index + 1];
    return currentMessage.senderId !== nextMessage.senderId;
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto py-4 space-y-1">
      {/* Load more trigger */}
      {hasMore && (
        <div ref={topElementRef} className="flex justify-center py-4">
          {isLoading && (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

      {/* Messages */}
      <AnimatePresence initial={false}>
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
            showAvatar={shouldShowAvatar(index)}
            isLastInGroup={isLastInGroup(index)}
            onEdit={onEditMessage}
            onDelete={onDeleteMessage}
          />
        ))}
      </AnimatePresence>

      {/* Typing indicator */}
      <AnimatePresence>
        {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
      </AnimatePresence>

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
