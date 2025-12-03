import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Save } from "lucide-react";
import LocationSection from "./LocationSection"; // Use existing logic
import SelectSections from "./SelectSections"; // Use existing logic
import { toast } from "sonner";
import { Session } from "next-auth";
import { PersonalInfo } from "@/app/dashboard/profile/page";

export default function EditForm({
  personalInfo,
  setPersonalInfo,
  session,
  userId,
  setEditMode,
}: {
  personalInfo: PersonalInfo;
  setPersonalInfo: React.Dispatch<React.SetStateAction<PersonalInfo>>;
  session: Session | null;
  userId: string;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: keyof PersonalInfo) => (value: string) => {
    setPersonalInfo({ ...personalInfo, [name]: value });
  };

  // Clean interactive image uploader
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);

    try {
      let profilePictureUrl = personalInfo.profilePicture;

      // Handle Image Upload
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("folder", "profiles");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Failed to upload image");
        const { url } = await uploadRes.json();
        profilePictureUrl = url;
      }

      const updateData = { ...personalInfo, profilePicture: profilePictureUrl };

      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      // Update local state fully to reflect new image if uploaded
      setPersonalInfo(updateData);
      toast.success("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Avatar & Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Photo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative group cursor-pointer">
                <Avatar className="w-32 h-32 ring-2 ring-offset-2 ring-primary/20">
                  <AvatarImage
                    src={
                      preview ||
                      personalInfo.profilePicture ||
                      session?.user?.image ||
                      ""
                    }
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl bg-muted">
                    {session?.user?.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                >
                  <Camera className="w-8 h-8" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Click to change avatar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    name="firstName"
                    value={personalInfo.firstName || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    name="lastName"
                    value={personalInfo.lastName || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  name="phoneNumber"
                  value={personalInfo.phoneNumber || ""}
                  onChange={handleInputChange}
                  placeholder="+1..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <LocationSection
                location={personalInfo.location || ""}
                setLocation={(loc) =>
                  setPersonalInfo({ ...personalInfo, location: loc })
                }
              />
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  name="bio"
                  className="resize-none min-h-[120px]"
                  value={personalInfo.bio || ""}
                  onChange={handleInputChange}
                  placeholder="Tell us a little about yourself..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details & Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <SelectSections
                personalInfo={personalInfo}
                handleSelectChange={handleSelectChange}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating or Bottom Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => setEditMode(false)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="min-w-[140px]">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
