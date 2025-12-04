"use client";

import { motion } from "motion/react";
import { ArrowLeft, Phone, Video, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatAvatar } from "./ChatAvatar";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { OnlineIndicator } from "./OnlineIndicator";
import type { Conversation, Message } from "@/types/chat";
import { getConversationName, getConversationAvatar } from "@/types/chat";

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  typingUsers?: { userId: string; userName: string }[];
  isOnline?: boolean;
  isLoading?: boolean;
  isLoadingMessages?: boolean;
  hasMoreMessages?: boolean;
  onSendMessage: (
    content: string,
    attachmentUrl?: string,
    attachmentType?: string
  ) => Promise<void>;
  onTyping?: () => void;
  onLoadMoreMessages?: () => void;
  onEditMessage?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ChatWindow({
  conversation,
  messages,
  currentUserId,
  typingUsers = [],
  isOnline = false,
  isLoading = false,
  isLoadingMessages = false,
  hasMoreMessages = false,
  onSendMessage,
  onTyping,
  onLoadMoreMessages,
  onEditMessage,
  onDeleteMessage,
  onBack,
  showBackButton = false,
}: ChatWindowProps) {
  // Empty state
  if (!conversation && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center">
            <span className="text-4xl">💬</span>
          </div>
          <h3 className="text-xl font-medium text-foreground">
            Select a conversation
          </h3>
          <p className="text-muted-foreground">
            Choose a chat from the sidebar or start a new one
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4 flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`flex gap-2 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}
            >
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton
                className={`h-16 ${i % 2 === 0 ? "w-48" : "w-64"} rounded-2xl`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const name = getConversationName(conversation!, currentUserId);
  const avatar = getConversationAvatar(conversation!, currentUserId);

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="md:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}

            <ChatAvatar
              src={avatar}
              name={name}
              isOnline={isOnline}
              showOnlineStatus={!conversation?.isGroup}
              size="md"
            />

            <div>
              <h3 className="font-semibold text-foreground">{name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {!conversation?.isGroup && (
                  <>
                    <OnlineIndicator isOnline={isOnline} size="sm" />
                    <span>{isOnline ? "Online" : "Offline"}</span>
                  </>
                )}
                {conversation?.isGroup && (
                  <span>{conversation.participants.length} participants</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        typingUsers={typingUsers}
        isLoading={isLoadingMessages}
        hasMore={hasMoreMessages}
        onLoadMore={onLoadMoreMessages}
        onEditMessage={onEditMessage}
        onDeleteMessage={onDeleteMessage}
      />

      {/* Input */}
      <MessageInput
        onSend={onSendMessage}
        onTyping={onTyping}
        placeholder={`Message ${name}...`}
      />
    </div>
  );
}
