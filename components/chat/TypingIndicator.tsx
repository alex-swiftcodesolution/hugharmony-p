"use client";

import { motion } from "motion/react";

interface TypingIndicatorProps {
  users: { userId: string; userName: string }[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const text =
    users.length === 1
      ? `${users[0].userName} is typing`
      : users.length === 2
      ? `${users[0].userName} and ${users[1].userName} are typing`
      : `${users[0].userName} and ${users.length - 1} others are typing`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground"
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      <span>{text}</span>
    </motion.div>
  );
}
