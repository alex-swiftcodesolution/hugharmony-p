import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const relationshipOptions = [
  "Single",
  "In a Relationship",
  "Married",
  "Divorced",
  "Widowed",
  "Other",
];
const orientationOptions = ["Straight", "Gay", "Lesbian", "Bisexual", "Other"];
const ethnicityOptions = [
  "Caucasian",
  "African American",
  "Asian",
  "Hispanic",
  "Native American",
  "Other",
];
const zodiacOptions = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];
const petOptions = ["Owns Dog(s)", "Owns Cat(s)", "Owns Other Pets", "No Pets"];

export default function SelectSections({
  personalInfo,
  handleSelectChange,
}: {
  personalInfo: PersonalInfo;
  handleSelectChange: (name: keyof PersonalInfo) => (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label>Relationship Status</Label>
        <Select
          value={personalInfo.relationshipStatus || ""}
          onValueChange={handleSelectChange("relationshipStatus")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {relationshipOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Orientation</Label>
        <Select
          value={personalInfo.orientation || ""}
          onValueChange={handleSelectChange("orientation")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {orientationOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Height</Label>
        <Input
          name="height"
          value={personalInfo.height || ""}
          onChange={(e) => handleSelectChange("height")(e.target.value)}
        />
      </div>
      <div>
        <Label>Ethnicity</Label>
        <Select
          value={personalInfo.ethnicity || ""}
          onValueChange={handleSelectChange("ethnicity")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ethnicityOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Zodiac Sign</Label>
        <Select
          value={personalInfo.zodiacSign || ""}
          onValueChange={handleSelectChange("zodiacSign")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {zodiacOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Favorite Color</Label>
        <div className="flex gap-3 mt-1.5">
          <div className="relative w-10 h-10 shrink-0 rounded-full border shadow-sm overflow-hidden ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            {/* The Visual Swatch */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundColor: personalInfo.favoriteColor || "#ffffff",
              }}
            />
            {/* The Invisible Native Picker */}
            <input
              type="color"
              className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 opacity-0 cursor-pointer"
              value={
                personalInfo.favoriteColor?.startsWith("#")
                  ? personalInfo.favoriteColor
                  : "#000000"
              }
              onChange={(e) =>
                handleSelectChange("favoriteColor")(e.target.value)
              }
            />
          </div>
          <Input
            name="favoriteColor"
            value={personalInfo.favoriteColor || ""}
            onChange={(e) =>
              handleSelectChange("favoriteColor")(e.target.value)
            }
            placeholder="#000000 or Blue"
            className="font-mono"
          />
        </div>
      </div>
      <div>
        <Label>Favorite Movie / TV Show</Label>
        <Input
          name="favoriteMovieOrShow"
          value={personalInfo.favoriteMovieOrShow || ""}
          onChange={(e) =>
            handleSelectChange("favoriteMovieOrShow")(e.target.value)
          }
        />
      </div>
      <div>
        <Label>Pet Ownership</Label>
        <Select
          value={personalInfo.petOwnership || ""}
          onValueChange={handleSelectChange("petOwnership")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {petOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
