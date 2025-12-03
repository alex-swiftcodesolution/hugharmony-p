import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

const ALLOWED_UPDATE_FIELDS = [
  "firstName",
  "lastName",
  "phoneNumber",
  "location",
  "bio",
  "relationshipStatus",
  "orientation",
  "height",
  "ethnicity",
  "zodiacSign",
  "favoriteColor",
  "favoriteMovieOrShow",
  "petOwnership",
  "profilePicture",
] as const;

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { personalInfo: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const data = await req.json();

  try {
    const existing = await prisma.personalInfo.findUnique({
      where: { userId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (field in data) {
        updateData[field] = data[field];
      }
    }

    const updated = await prisma.personalInfo.update({
      where: { userId: id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
