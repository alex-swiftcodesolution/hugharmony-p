import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  pusherServer,
  PUSHER_EVENTS,
  getConversationChannel,
} from "@/lib/pusher-server";

type RouteContext = { params: Promise<{ messageId: string }> };

// PATCH edit a message
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { messageId } = await ctx.params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.senderId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only edit your own messages" },
        { status: 403 }
      );
    }

    if (message.isDeleted) {
      return NextResponse.json(
        { error: "Cannot edit deleted message" },
        { status: 400 }
      );
    }

    const { content } = await req.json();

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: content.trim(),
        isEdited: true,
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

    // 🔥 Trigger Pusher event for message update
    await pusherServer.trigger(
      getConversationChannel(message.conversationId),
      PUSHER_EVENTS.MESSAGE_UPDATED,
      updatedMessage
    );

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Error editing message:", error);
    return NextResponse.json(
      { error: "Failed to edit message" },
      { status: 500 }
    );
  }
}

// DELETE soft delete a message
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { messageId } = await ctx.params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.senderId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own messages" },
        { status: 403 }
      );
    }

    const deletedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        content: "This message was deleted",
      },
    });

    // 🔥 Trigger Pusher event for message deletion
    await pusherServer.trigger(
      getConversationChannel(message.conversationId),
      PUSHER_EVENTS.MESSAGE_DELETED,
      { messageId, conversationId: message.conversationId }
    );

    return NextResponse.json({
      message: "Message deleted",
      id: deletedMessage.id,
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
