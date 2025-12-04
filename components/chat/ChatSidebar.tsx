"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConversationList } from "./ConversationList";
import { UserSearchDialog } from "./UserSearchDialog";
import type { Conversation } from "@/types/chat";

interface ChatSidebarProps {
  conversations: Conversation[];
  currentUserId: string;
  activeConversationId: string | null;
  onlineUsers: Set<string>;
  isLoading?: boolean;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: (userId: string) => Promise<void>;
}

export function ChatSidebar({
  conversations,
  currentUserId,
  activeConversationId,
  onlineUsers,
  isLoading = false,
  onSelectConversation,
  onNewConversation,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = searchQuery
    ? conversations.filter((conv) => {
        const otherParticipant = conv.participants.find(
          (p) => p.userId !== currentUserId
        );
        const name =
          conv.name ||
          otherParticipant?.user.personalInfo?.firstName ||
          otherParticipant?.user.name ||
          "";
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : conversations;

  return (
    <div className="flex flex-col h-full border-r bg-background/50">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Messages</h2>
          <UserSearchDialog onSelectUser={onNewConversation} />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        <ConversationList
          conversations={filteredConversations}
          currentUserId={currentUserId}
          activeConversationId={activeConversationId}
          onlineUsers={onlineUsers}
          isLoading={isLoading}
          onSelectConversation={onSelectConversation}
        />
      </div>
    </div>
  );
}
