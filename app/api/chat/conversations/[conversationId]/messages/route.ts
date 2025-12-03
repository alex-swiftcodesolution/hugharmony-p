import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  pusherServer,
  PUSHER_EVENTS,
  getConversationChannel,
  getUserChannel,
} from "@/lib/pusher-server";

type RouteContext = { params: Promise<{ conversationId: string }> };

// GET messages for a conversation (with pagination)
export async function GET(req: NextRequest, ctx: RouteContext) {
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

    // Parse pagination params
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "50");

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
      },
      include: {
        sender: {
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
        readBy: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    const hasMore = messages.length > limit;
    const messagesToReturn = hasMore ? messages.slice(0, -1) : messages;
    const nextCursor = hasMore
      ? messagesToReturn[messagesToReturn.length - 1]?.id
      : null;

    // Update lastReadAt for current user
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    return NextResponse.json({
      messages: messagesToReturn.reverse(),
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST send a new message
export async function POST(req: NextRequest, ctx: RouteContext) {
  const { conversationId } = await ctx.params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a participant and get all participants
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: { userId: session.user.id },
        },
      },
      include: {
        participants: {
          select: { userId: true },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const {
      content,
      type = "TEXT",
      attachmentUrl,
      attachmentType,
    } = await req.json();

    if (!content && !attachmentUrl) {
      return NextResponse.json(
        { error: "Message content or attachment is required" },
        { status: 400 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content: content || "",
        type,
        conversationId,
        senderId: session.user.id,
        attachmentUrl,
        attachmentType,
      },
      include: {
        sender: {
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
        readBy: true,
      },
    });

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Update sender's lastReadAt
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    // 🔥 Trigger Pusher event - send to conversation channel
    await pusherServer.trigger(
      getConversationChannel(conversationId),
      PUSHER_EVENTS.NEW_MESSAGE,
      message
    );

    // 🔥 Notify other participants on their personal channels (for notifications)
    const otherParticipantIds = conversation.participants
      .map((p) => p.userId)
      .filter((id) => id !== session.user?.id);

    await Promise.all(
      otherParticipantIds.map((userId) =>
        pusherServer.trigger(
          getUserChannel(userId),
          PUSHER_EVENTS.NEW_MESSAGE,
          {
            conversationId,
            message,
          }
        )
      )
    );

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
