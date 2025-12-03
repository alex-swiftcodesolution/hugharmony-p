import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type RouteContext = { params: Promise<{ conversationId: string }> };

// GET single conversation with details
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { conversationId } = await ctx.params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                personalInfo: {
                  select: {
                    firstName: true,
                    lastName: true,
                    profilePicture: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

// DELETE leave/delete conversation
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { conversationId } = await ctx.params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Remove user from conversation
    await prisma.conversationParticipant.delete({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    });

    // Check remaining participants
    const remainingParticipants = await prisma.conversationParticipant.count({
      where: { conversationId },
    });

    // If no participants left, delete the conversation
    if (remainingParticipants === 0) {
      await prisma.conversation.delete({
        where: { id: conversationId },
      });
    }

    return NextResponse.json({ message: "Left conversation successfully" });
  } catch (error) {
    console.error("Error leaving conversation:", error);
    return NextResponse.json(
      { error: "Failed to leave conversation" },
      { status: 500 }
    );
  }
}
