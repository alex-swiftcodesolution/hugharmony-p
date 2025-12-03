import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  pusherServer,
  PUSHER_EVENTS,
  getConversationChannel,
} from "@/lib/pusher-server";

type RouteContext = { params: Promise<{ conversationId: string }> };

// POST trigger typing indicator
export async function POST(req: NextRequest, ctx: RouteContext) {
  const { conversationId } = await ctx.params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a participant
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

    const { isTyping } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        personalInfo: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const eventName = isTyping
      ? PUSHER_EVENTS.TYPING_START
      : PUSHER_EVENTS.TYPING_STOP;

    await pusherServer.trigger(
      getConversationChannel(conversationId),
      eventName,
      {
        userId: session.user.id,
        userName: user?.personalInfo?.firstName || user?.name || "Someone",
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending typing indicator:", error);
    return NextResponse.json(
      { error: "Failed to send typing indicator" },
      { status: 500 }
    );
  }
}
