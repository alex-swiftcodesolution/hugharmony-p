"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, MessageSquarePlus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatAvatar } from "./ChatAvatar";
import { cn } from "@/lib/utils";
import type { ChatUser } from "@/types/chat";
import { getUserDisplayName, getUserAvatar } from "@/types/chat";

interface UserSearchDialogProps {
  onSelectUser: (userId: string) => Promise<void>;
  trigger?: React.ReactNode;
}

export function UserSearchDialog({
  onSelectUser,
  trigger,
}: UserSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/chat/users/search?q=${encodeURIComponent(query)}&limit=10`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelectUser = async (userId: string) => {
    setSelecting(userId);
    try {
      await onSelectUser(userId);
      setOpen(false);
      setQuery("");
      setResults([]);
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setSelecting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="shrink-0">
            <MessageSquarePlus className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-9"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  disabled={selecting !== null}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg",
                    "hover:bg-accent transition-colors text-left",
                    selecting === user.id && "opacity-50"
                  )}
                >
                  <ChatAvatar
                    src={getUserAvatar(user)}
                    name={getUserDisplayName(user)}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {getUserDisplayName(user)}
                    </p>
                    {user.email && (
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                  {selecting === user.id && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No users found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          )}

          {/* Initial state */}
          {!loading && query.length < 2 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Start typing to search for users</p>
              <p className="text-sm">Minimum 2 characters</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
