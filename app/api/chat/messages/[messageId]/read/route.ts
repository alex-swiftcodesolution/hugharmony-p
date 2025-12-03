import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  pusherServer,
  PUSHER_EVENTS,
  getConversationChannel,
} from "@/lib/pusher-server";

type RouteContext = { params: Promise<{ messageId: string }> };

// POST mark message as read
export async function POST(_req: NextRequest, ctx: RouteContext) {
  const { messageId } = await ctx.params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            participants: true,
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const isParticipant = message.conversation.participants.some(
      (p) => p.userId === session.user?.id
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: "You are not a participant in this conversation" },
        { status: 403 }
      );
    }

    if (message.senderId === session.user.id) {
      return NextResponse.json({ message: "Cannot mark own message as read" });
    }

    const readReceipt = await prisma.messageRead.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId: session.user.id,
        },
      },
      update: {
        readAt: new Date(),
      },
      create: {
        messageId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: message.conversationId,
          userId: session.user.id,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    // 🔥 Trigger Pusher event for read receipt
    await pusherServer.trigger(
      getConversationChannel(message.conversationId),
      PUSHER_EVENTS.MESSAGE_READ,
      {
        messageId,
        conversationId: message.conversationId,
        userId: session.user.id,
        readAt: readReceipt.readAt,
      }
    );

    return NextResponse.json(readReceipt);
  } catch (error) {
    console.error("Error marking message as read:", error);
    return NextResponse.json(
      { error: "Failed to mark message as read" },
      { status: 500 }
    );
  }
}
