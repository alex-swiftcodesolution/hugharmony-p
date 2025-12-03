"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OnlineIndicator } from "./OnlineIndicator";
import { cn } from "@/lib/utils";

interface ChatAvatarProps {
  src?: string | null;
  name: string;
  isOnline?: boolean;
  showOnlineStatus?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ChatAvatar({
  src,
  name,
  isOnline = false,
  showOnlineStatus = false,
  size = "md",
  className,
}: ChatAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const fallbackSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative">
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage
          src={src || undefined}
          alt={name}
          className="object-cover"
        />
        <AvatarFallback
          className={cn(
            "bg-primary/10 text-primary",
            fallbackSizeClasses[size]
          )}
        >
          {initials || "?"}
        </AvatarFallback>
      </Avatar>
      {showOnlineStatus && (
        <OnlineIndicator
          isOnline={isOnline}
          size="sm"
          className="absolute -bottom-0.5 -right-0.5"
        />
      )}
    </div>
  );
}
