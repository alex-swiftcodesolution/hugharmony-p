"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import GoogleSignInBtn from "@/components/auth/google-signin-btn";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center dark:bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center dark:bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center space-y-4 py-32 px-16 sm:items-start">
        <h1 className="text-4xl font-bold">Welcome to Hugharmony P!</h1>
        <GoogleSignInBtn />
      </main>
    </div>
  );
}
