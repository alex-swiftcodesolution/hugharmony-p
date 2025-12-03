import { MessageType } from "@prisma/client";

export interface ChatUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  personalInfo?: {
    firstName: string | null;
    lastName: string | null;
    profilePicture: string | null;
  } | null;
}

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  conversationId: string;
  senderId: string;
  sender: ChatUser;
  isEdited: boolean;
  isDeleted: boolean;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  readBy: MessageRead[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageRead {
  id: string;
  messageId: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
  };
  readAt: string;
}

export interface Participant {
  id: string;
  conversationId: string;
  userId: string;
  user: ChatUser;
  joinedAt: string;
  lastReadAt: string;
}

export interface Conversation {
  id: string;
  name: string | null;
  isGroup: boolean;
  participants: Participant[];
  messages?: Message[];
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessagesResponse {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

// Helper to get display name for a user
export function getUserDisplayName(user: ChatUser): string {
  if (user.personalInfo?.firstName) {
    return user.personalInfo.lastName
      ? `${user.personalInfo.firstName} ${user.personalInfo.lastName}`
      : user.personalInfo.firstName;
  }
  return user.name || user.email || "Unknown";
}

// Helper to get avatar URL
export function getUserAvatar(user: ChatUser): string | null {
  return user.personalInfo?.profilePicture || user.image || null;
}

// Helper to get conversation display name (for 1-on-1 chats)
export function getConversationName(
  conversation: Conversation,
  currentUserId: string
): string {
  if (conversation.isGroup && conversation.name) {
    return conversation.name;
  }

  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== currentUserId
  );

  return otherParticipant ? getUserDisplayName(otherParticipant.user) : "Chat";
}

// Helper to get conversation avatar (for 1-on-1 chats)
export function getConversationAvatar(
  conversation: Conversation,
  currentUserId: string
): string | null {
  if (conversation.isGroup) {
    return null; // Could return a group icon
  }

  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== currentUserId
  );

  return otherParticipant ? getUserAvatar(otherParticipant.user) : null;
}
