"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { format, isToday, isYesterday } from "date-fns";
import {
  Check,
  CheckCheck,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatAvatar } from "./ChatAvatar";
import { FileAttachment } from "./FileAttachment";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";
import { getUserDisplayName, getUserAvatar } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  isLastInGroup?: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  isLastInGroup = true,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const formatMessageTime = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) {
      return format(d, "h:mm a");
    } else if (isYesterday(d)) {
      return `Yesterday ${format(d, "h:mm a")}`;
    }
    return format(d, "MMM d, h:mm a");
  };

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditContent(message.content);
    }
  };

  const hasBeenRead = message.readBy.length > 0;
  const hasAttachment = !!message.attachmentUrl;
  const hasTextContent = !!message.content && message.content.trim() !== "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-2 group px-4",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div className="w-8 shrink-0">
        {showAvatar && isLastInGroup && !isOwn && (
          <ChatAvatar
            src={getUserAvatar(message.sender)}
            name={getUserDisplayName(message.sender)}
            size="sm"
          />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          isOwn ? "items-end" : "items-start"
        )}
      >
        {/* Sender name for group chats */}
        {!isOwn && showAvatar && isLastInGroup && (
          <span className="text-xs text-muted-foreground mb-1 px-1">
            {getUserDisplayName(message.sender)}
          </span>
        )}

        <div className="flex items-end gap-1">
          {/* Actions dropdown for own messages */}
          {isOwn && isHovered && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!hasAttachment && hasTextContent && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onDelete?.(message.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Message bubble container */}
          <div className="flex flex-col gap-1">
            {/* File/Image attachment - rendered outside the bubble for cleaner look */}
            {hasAttachment && !message.isDeleted && (
              <FileAttachment
                url={message.attachmentUrl!}
                type={message.attachmentType || message.type}
                isOwn={isOwn}
              />
            )}

            {/* Text content bubble */}
            {(hasTextContent || message.isDeleted || isEditing) && (
              <div
                className={cn(
                  "rounded-2xl px-4 py-2 shadow-sm",
                  isOwn
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted rounded-bl-md",
                  message.isDeleted && "italic opacity-60"
                )}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleEditSubmit}
                    className="bg-transparent border-none outline-none min-w-[100px] text-sm"
                    autoFocus
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap wrap-break-word">
                    {message.isDeleted
                      ? "This message was deleted"
                      : message.content}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Timestamp and read status */}
        <div
          className={cn(
            "flex items-center gap-1 mt-1 px-1",
            isOwn ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span className="text-[10px] text-muted-foreground">
            {formatMessageTime(message.createdAt)}
            {message.isEdited && " · edited"}
          </span>
          {isOwn && (
            <span className="text-muted-foreground">
              {hasBeenRead ? (
                <CheckCheck className="h-3 w-3 text-primary" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
