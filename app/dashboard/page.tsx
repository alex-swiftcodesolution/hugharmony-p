"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface PersonalInfo {
  firstName?: string | null;
  lastName?: string | null;
  profilePicture?: string | null;
  phoneNumber?: string | null;
  location?: string | null;
  bio?: string | null;
}

export default function HomePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setPersonalInfo(data.personalInfo || {});
        } else {
          setPersonalInfo({});
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setPersonalInfo({});
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You are not logged in!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  // Prefer personalInfo fields first, fallback to session
  const displayName =
    personalInfo?.firstName || personalInfo?.lastName
      ? `${personalInfo.firstName || ""} ${personalInfo.lastName || ""}`.trim()
      : session.user?.name;

  const displayImage = personalInfo?.profilePicture || session.user?.image;
  const email = session.user?.email;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Avatar className="h-16 w-16">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={displayName || "User Avatar"}
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              <AvatarFallback className="text-xl font-medium">
                {displayName ? getInitials(displayName) : "U"}
              </AvatarFallback>
            )}
          </Avatar>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold">{displayName}</h1>
            <p className="text-sm text-muted-foreground mt-1">{email}</p>
          </div>
          {personalInfo?.bio && (
            <p className="text-sm text-muted-foreground pt-4 border-t">
              {personalInfo.bio}
            </p>
          )}
        </CardContent>
        <CardFooter className="text-muted-foreground text-xs py-2">
          <p>&copy; 2024 Your Company</p>
        </CardFooter>
      </Card>
    </div>
  );
}
