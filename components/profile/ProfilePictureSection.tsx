import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Session } from "next-auth";

interface PersonalInfo {
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

export default function ProfilePictureSection({
  preview,
  personalInfo,
  session,
  handleFileChange,
}: {
  preview: string | null;
  personalInfo: PersonalInfo;
  session: Session | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <Label>Profile Picture</Label>
      {preview || personalInfo.profilePicture ? (
        <Image
          width={300}
          height={300}
          src={
            preview || personalInfo.profilePicture || session?.user?.image || ""
          }
          alt="Preview"
          className="w-32 h-32 object-cover rounded-full mb-2"
        />
      ) : null}
      <Input type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  );
}
