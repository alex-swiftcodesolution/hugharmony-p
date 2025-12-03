"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { format, isToday, isYesterday } from "date-fns";
import Image from "next/image";
import {
  Check,
  CheckCheck,
  MoreHorizontal,
  Pencil,
  Trash2,
  Download,
  FileText,
  File,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { ChatAvatar } from "./ChatAvatar";
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
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

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
  const isImage =
    message.type === "IMAGE" ||
    message.attachmentType?.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(message.attachmentUrl || "");

  // Get file name from URL
  const getFileName = (url: string) => {
    try {
      const pathname = new URL(url).pathname;
      const name = pathname.split("/").pop() || "file";
      // Remove random suffix if present (e.g., file-abc123.pdf -> file.pdf)
      return name.replace(/-[a-zA-Z0-9]{6,}(?=\.[^.]+$)/, "");
    } catch {
      return "file";
    }
  };

  // Get file extension
  const getFileExtension = (url: string) => {
    const match = url.match(/\.([^.?]+)(?:\?|$)/);
    return match ? match[1].toUpperCase() : "FILE";
  };

  return (
    <>
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
        <div className="w-8 flex-shrink-0">
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
                  {!hasAttachment && (
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

            {/* Message bubble */}
            <div
              className={cn(
                "rounded-2xl overflow-hidden shadow-sm",
                isOwn
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted rounded-bl-md",
                message.isDeleted && "italic opacity-60",
                // Remove padding if there's an image with no text
                hasAttachment && isImage && !message.content
                  ? "p-0"
                  : "px-4 py-2"
              )}
            >
              {/* Image attachment */}
              {hasAttachment && isImage && !message.isDeleted && (
                <div
                  className={cn("cursor-pointer", message.content && "mb-2")}
                  onClick={() => setImagePreviewOpen(true)}
                >
                  <div className="relative max-w-[280px] max-h-[280px] overflow-hidden rounded-lg">
                    <Image
                      src={message.attachmentUrl!}
                      alt="Attachment"
                      width={280}
                      height={280}
                      className="object-cover hover:opacity-90 transition-opacity"
                      style={{
                        width: "auto",
                        height: "auto",
                        maxWidth: "280px",
                        maxHeight: "280px",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* File attachment (non-image) */}
              {hasAttachment && !isImage && !message.isDeleted && (
                <a
                  href={message.attachmentUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                    isOwn
                      ? "bg-primary-foreground/10 hover:bg-primary-foreground/20"
                      : "bg-background hover:bg-background/80",
                    message.content && "mb-2"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isOwn ? "bg-primary-foreground/20" : "bg-primary/10"
                    )}
                  >
                    <FileText
                      className={cn(
                        "w-5 h-5",
                        isOwn ? "text-primary-foreground" : "text-primary"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        isOwn ? "text-primary-foreground" : "text-foreground"
                      )}
                    >
                      {getFileName(message.attachmentUrl!)}
                    </p>
                    <p
                      className={cn(
                        "text-xs",
                        isOwn
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {getFileExtension(message.attachmentUrl!)}
                    </p>
                  </div>
                  <Download
                    className={cn(
                      "w-4 h-4 shrink-0",
                      isOwn
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  />
                </a>
              )}

              {/* Text content */}
              {isEditing ? (
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleEditSubmit}
                  className="bg-transparent border-none outline-none min-w-[100px] px-4 py-2"
                  autoFocus
                />
              ) : message.content ? (
                <p
                  className={cn(
                    "text-sm whitespace-pre-wrap break-words",
                    hasAttachment && isImage && "px-4 py-2"
                  )}
                >
                  {message.content}
                </p>
              ) : null}
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

      {/* Image preview dialog */}
      {hasAttachment && isImage && (
        <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-black/90 border-none">
            <DialogClose className="absolute top-4 right-4 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
            <div className="flex items-center justify-center p-4">
              <Image
                src={message.attachmentUrl!}
                alt="Full size preview"
                width={1200}
                height={900}
                className="max-w-full max-h-[85vh] object-contain"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <a
                href={message.attachmentUrl!}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <Button variant="secondary" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </a>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
