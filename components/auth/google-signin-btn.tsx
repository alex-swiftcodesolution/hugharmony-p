"use client";

import { signIn } from "next-auth/react";
import { Button } from "../ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import GoogleIcon from "../ui/GoogleIcon";

export default function GoogleSignInBtn() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      toast.info("Redirecting to Google Sign-In...");
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error("Failed to sign in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Button disabled={loading} variant="default" onClick={handleGoogleSignIn}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <GoogleIcon className="mr-2 h-4 w-4" />
          Sign in with Google
        </>
      )}
    </Button>
  );
}
