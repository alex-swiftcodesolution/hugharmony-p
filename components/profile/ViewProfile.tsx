import { Session } from "next-auth";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Phone,
  User,
  Heart,
  Ruler,
  Globe,
  Sparkles,
  Palette,
  Film,
  PawPrint,
  Mail,
  LucideIcon,
} from "lucide-react";
import { PersonalInfo } from "@/app/dashboard/profile/page";

export default function ViewProfile({
  personalInfo,
  session,
}: {
  personalInfo: PersonalInfo;
  session: Session | null;
}) {
  const displayName =
    personalInfo.firstName && personalInfo.lastName
      ? `${personalInfo.firstName} ${personalInfo.lastName}`
      : session?.user?.name || "User";

  const displayImage =
    personalInfo.profilePicture ||
    session?.user?.image ||
    "/placeholder-avatar.png";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Identity Card */}
      <Card className="h-fit lg:col-span-1 border-muted/60 shadow-sm">
        <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-background shadow-lg">
              <Image
                src={displayImage}
                alt="Profile"
                width={128}
                height={128}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {displayName}
            </h2>
            <p className="text-muted-foreground text-sm flex items-center justify-center gap-1 mt-1">
              <Mail className="w-3 h-3" /> {session?.user?.email}
            </p>
          </div>

          <div className="w-full flex flex-wrap justify-center gap-2">
            {personalInfo.location && (
              <Badge variant="secondary" className="px-3 py-1">
                <MapPin className="w-3 h-3 mr-1" />{" "}
                {personalInfo.location.split(",")[0]}
              </Badge>
            )}
            {personalInfo.zodiacSign && (
              <Badge
                variant="outline"
                className="px-3 py-1 border-primary/20 text-primary"
              >
                <Sparkles className="w-3 h-3 mr-1" /> {personalInfo.zodiacSign}
              </Badge>
            )}
          </div>

          <Separator />

          <div className="w-full text-left space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" /> Phone
              </span>
              <span className="font-medium">
                {personalInfo.phoneNumber || "N/A"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right Column: Details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Bio Section */}
        <Card className="border-muted/60 shadow-sm gap-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> About Me
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {personalInfo.bio || "No bio added yet."}
            </p>
          </CardContent>
        </Card>

        {/* Grid of Attributes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoGroup
            title="Personal Stats"
            icon={<User className="w-5 h-5 text-blue-500" />}
          >
            <InfoItem
              label="Relationship"
              value={personalInfo.relationshipStatus}
              icon={Heart}
            />
            <InfoItem
              label="Orientation"
              value={personalInfo.orientation}
              icon={Heart}
            />
            <InfoItem label="Height" value={personalInfo.height} icon={Ruler} />
            <InfoItem
              label="Ethnicity"
              value={personalInfo.ethnicity}
              icon={Globe}
            />
          </InfoGroup>

          <InfoGroup
            title="Favorites & Lifestyle"
            icon={<Sparkles className="w-5 h-5 text-purple-500" />}
          >
            <InfoItem
              label="Color"
              icon={Palette}
              customValue={
                personalInfo.favoriteColor ? (
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-xs uppercase font-mono text-muted-foreground">
                      {personalInfo.favoriteColor}
                    </span>
                    <div
                      className="w-6 h-6 rounded-full border shadow-sm"
                      style={{ backgroundColor: personalInfo.favoriteColor }}
                      title={personalInfo.favoriteColor}
                    />
                  </div>
                ) : null
              }
            />
            <InfoItem
              label="Movie/Show"
              value={personalInfo.favoriteMovieOrShow}
              icon={Film}
            />
            <InfoItem
              label="Pets"
              value={personalInfo.petOwnership}
              icon={PawPrint}
            />
          </InfoGroup>
        </div>
      </div>
    </div>
  );
}

// Small Helper Components for cleaner JSX
function InfoGroup({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-muted/60 shadow-sm h-full gap-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">{children}</CardContent>
    </Card>
  );
}

function InfoItem({
  label,
  value,
  customValue,
  icon: Icon,
}: {
  label: string;
  value?: string | null;
  customValue?: React.ReactNode;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="p-1.5 bg-background rounded-md border shadow-sm">
          <Icon className="w-3.5 h-3.5" />
        </div>
        {label}
      </div>
      <span className="text-sm font-medium text-foreground text-right truncate max-w-[150px]">
        {customValue ? customValue : value || "-"}
      </span>
    </div>
  );
}
