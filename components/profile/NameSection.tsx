import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export default function NameSection({
  personalInfo,
  handleInputChange,
}: {
  personalInfo: PersonalInfo;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label>First Name</Label>
        <Input
          name="firstName"
          value={personalInfo.firstName || ""}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <Label>Last Name</Label>
        <Input
          name="lastName"
          value={personalInfo.lastName || ""}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}
