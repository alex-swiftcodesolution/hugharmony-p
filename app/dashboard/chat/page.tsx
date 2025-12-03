"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatStore } from "@/stores/chat-store";
import { usePusher, useTypingIndicator } from "@/hooks/usePusher";
import { useGlobalPresence } from "@/hooks/useGlobalPresence";
import type { Conversation, Message, MessagesResponse } from "@/types/chat";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationIdParam = searchParams.get("id");

  const {
    conversations,
    activeConversationId,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    hasMoreMessages,
    nextCursor,
    typingUsers,
    onlineUsers,
    setConversations,
    addConversation,
    updateConversation,
    setActiveConversation,
    setLoadingConversations,
    setMessages,
    addMessage,
    updateMessage,
    prependMessages,
    setLoadingMessages,
    setPagination,
    clearMessages,
    addTypingUser,
    removeTypingUser,
    incrementUnreadCount,
    resetUnreadCount,
  } = useChatStore();

  const [isMobileViewingChat, setIsMobileViewingChat] = useState(false);

  const currentUserId = session?.user?.id;
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  // 🔥 Subscribe to global presence channel for online status
  useGlobalPresence(currentUserId);

  // Get typing users for active conversation
  const activeTypingUsers = activeConversationId
    ? typingUsers.get(activeConversationId) || []
    : [];

  // Check if other participant is online
  const isOtherUserOnline = useCallback(() => {
    if (!activeConversation || activeConversation.isGroup) return false;
    const otherParticipant = activeConversation.participants.find(
      (p) => p.userId !== currentUserId
    );
    if (!otherParticipant) return false;

    const isOnline = onlineUsers.has(otherParticipant.userId);
    console.log(
      `Checking online status for ${otherParticipant.userId}:`,
      isOnline,
      "Online users:",
      Array.from(onlineUsers)
    );
    return isOnline;
  }, [activeConversation, currentUserId, onlineUsers]);

  // Pusher handlers
  const handleNewMessage = useCallback(
    (message: Message) => {
      if (message.conversationId === activeConversationId) {
        addMessage(message);
      } else {
        incrementUnreadCount(message.conversationId);
      }
      updateConversation(message.conversationId, {
        updatedAt: message.createdAt,
        messages: [message],
      });
    },
    [activeConversationId, addMessage, incrementUnreadCount, updateConversation]
  );

  const handleMessageUpdated = useCallback(
    (message: Message) => {
      updateMessage(message.id, message);
    },
    [updateMessage]
  );

  const handleMessageDeleted = useCallback(
    (data: { messageId: string }) => {
      updateMessage(data.messageId, {
        isDeleted: true,
        content: "This message was deleted",
      });
    },
    [updateMessage]
  );

  const handleTypingStart = useCallback(
    (data: { userId: string; userName: string }) => {
      if (activeConversationId && data.userId !== currentUserId) {
        addTypingUser(activeConversationId, data);
        setTimeout(() => {
          removeTypingUser(activeConversationId, data.userId);
        }, 3000);
      }
    },
    [activeConversationId, currentUserId, addTypingUser, removeTypingUser]
  );

  const handleTypingStop = useCallback(
    (data: { userId: string }) => {
      if (activeConversationId) {
        removeTypingUser(activeConversationId, data.userId);
      }
    },
    [activeConversationId, removeTypingUser]
  );

  // Subscribe to Pusher for messages
  usePusher({
    conversationId: activeConversationId || undefined,
    userId: currentUserId,
    onNewMessage: handleNewMessage,
    onMessageUpdated: handleMessageUpdated,
    onMessageDeleted: handleMessageDeleted,
    onTypingStart: handleTypingStart,
    onTypingStop: handleTypingStop,
  });

  // Typing indicator
  const { startTyping, stopTyping } = useTypingIndicator(
    activeConversationId || undefined
  );

  // Fetch conversations
  useEffect(() => {
    if (!currentUserId) return;

    async function fetchConversations() {
      setLoadingConversations(true);
      try {
        const res = await fetch("/api/chat/conversations");
        if (res.ok) {
          const data: Conversation[] = await res.json();
          setConversations(data);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setLoadingConversations(false);
      }
    }

    fetchConversations();
  }, [currentUserId, setConversations, setLoadingConversations]);

  // Handle conversation from URL param
  useEffect(() => {
    if (conversationIdParam && conversations.length > 0) {
      setActiveConversation(conversationIdParam);
      setIsMobileViewingChat(true);
    }
  }, [conversationIdParam, conversations, setActiveConversation]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      clearMessages();
      return;
    }

    async function fetchMessages() {
      setLoadingMessages(true);
      try {
        const res = await fetch(
          `/api/chat/conversations/${activeConversationId}/messages`
        );
        if (res.ok) {
          const data: MessagesResponse = await res.json();
          setMessages(data.messages);
          setPagination(data.hasMore, data.nextCursor);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    }

    fetchMessages();
    resetUnreadCount(activeConversationId);
  }, [
    activeConversationId,
    setMessages,
    setPagination,
    setLoadingMessages,
    clearMessages,
    resetUnreadCount,
  ]);

  // Load more messages
  const handleLoadMoreMessages = async () => {
    if (!activeConversationId || !nextCursor || isLoadingMessages) return;

    setLoadingMessages(true);
    try {
      const res = await fetch(
        `/api/chat/conversations/${activeConversationId}/messages?cursor=${nextCursor}`
      );
      if (res.ok) {
        const data: MessagesResponse = await res.json();
        prependMessages(data.messages);
        setPagination(data.hasMore, data.nextCursor);
      }
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send message
  const handleSendMessage = async (content: string, attachmentUrl?: string) => {
    if (!activeConversationId) return;

    stopTyping();

    const res = await fetch(
      `/api/chat/conversations/${activeConversationId}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          attachmentUrl,
          type: attachmentUrl ? "IMAGE" : "TEXT",
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to send message");
    }
  };

  // Edit message
  const handleEditMessage = async (messageId: string, content: string) => {
    const res = await fetch(`/api/chat/messages/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      console.error("Failed to edit message");
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    const res = await fetch(`/api/chat/messages/${messageId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      console.error("Failed to delete message");
    }
  };

  // Select conversation
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    setIsMobileViewingChat(true);
    router.push(`/dashboard/chat?id=${conversationId}`, { scroll: false });
  };

  // Start new conversation
  const handleNewConversation = async (userId: string) => {
    const res = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantIds: [userId] }),
    });

    if (res.ok) {
      const conversation: Conversation = await res.json();
      addConversation(conversation);
      handleSelectConversation(conversation.id);
    }
  };

  // Back to conversation list (mobile)
  const handleBack = () => {
    setIsMobileViewingChat(false);
    setActiveConversation(null);
    router.push("/dashboard/chat", { scroll: false });
  };

  if (status === "loading") {
    return <ChatPageSkeleton />;
  }

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Please sign in to access chat</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar - hidden on mobile when viewing chat */}
      <motion.div
        className={`w-full md:w-80 lg:w-96 flex-shrink-0 ${
          isMobileViewingChat ? "hidden md:flex" : "flex"
        }`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <ChatSidebar
          conversations={conversations}
          currentUserId={currentUserId}
          activeConversationId={activeConversationId}
          onlineUsers={onlineUsers}
          isLoading={isLoadingConversations}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />
      </motion.div>

      {/* Chat window - hidden on mobile when not viewing chat */}
      <motion.div
        className={`flex-1 ${!isMobileViewingChat ? "hidden md:flex" : "flex"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <ChatWindow
          conversation={activeConversation || null}
          messages={messages}
          currentUserId={currentUserId}
          typingUsers={activeTypingUsers}
          isOnline={isOtherUserOnline()}
          isLoading={isLoadingConversations && !activeConversation}
          isLoadingMessages={isLoadingMessages}
          hasMoreMessages={hasMoreMessages}
          onSendMessage={handleSendMessage}
          onTyping={startTyping}
          onLoadMoreMessages={handleLoadMoreMessages}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          onBack={handleBack}
          showBackButton={isMobileViewingChat}
        />
      </motion.div>
    </div>
  );
}

function ChatPageSkeleton() {
  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <div className="w-80 border-r p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Skeleton className="h-20 w-20 rounded-full" />
      </div>
    </div>
  );
}
