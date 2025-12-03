"use client";

import { SessionProvider as NextAuthProvider } from "next-auth/react";

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  return <NextAuthProvider>{children}</NextAuthProvider>;
}
