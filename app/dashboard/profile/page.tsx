"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ViewProfile from "@/components/profile/ViewProfile";
import EditForm from "@/components/profile/EditForm";
import { PenLine, X } from "lucide-react";

// Define interface centrally if possible, or import from a shared types file
export interface PersonalInfo {
  id?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  location?: string | null;
  bio?: string | null;
  relationshipStatus?: string | null;
  orientation?: string | null;
  height?: string | null;
  ethnicity?: string | null;
  zodiacSign?: string | null;
  favoriteColor?: string | null;
  favoriteMovieOrShow?: string | null;
  petOwnership?: string | null;
  profilePicture?: string | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const userId = session?.user?.id;

  useEffect(() => {
    if (status === "loading") return;
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setPersonalInfo(data.personalInfo || {});
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId, status]);

  if (status === "loading" || loading) return <ProfileSkeleton />;

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Action Bar */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {editMode ? "Edit Profile" : "My Profile"}
            </h1>
            <p className="text-muted-foreground">
              {editMode
                ? "Update your personal details and public information."
                : "Manage your personal information and privacy."}
            </p>
          </div>
          <Button
            variant={editMode ? "ghost" : "default"}
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className="gap-2"
          >
            {editMode ? (
              <>
                <X className="w-4 h-4" /> Cancel
              </>
            ) : (
              <>
                <PenLine className="w-4 h-4" /> Edit Profile
              </>
            )}
          </Button>
        </div>

        {/* Animated Content Switcher */}
        <AnimatePresence mode="wait">
          {editMode ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <EditForm
                personalInfo={personalInfo}
                setPersonalInfo={setPersonalInfo}
                session={session}
                userId={userId!}
                setEditMode={setEditMode}
              />
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ViewProfile personalInfo={personalInfo} session={session} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full md:col-span-2 rounded-xl" />
      </div>
    </div>
  );
}
