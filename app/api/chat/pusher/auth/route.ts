import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher-server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.text();
    const params = new URLSearchParams(data);
    const socketId = params.get("socket_id");
    const channelName = params.get("channel_name");

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: "Missing socket_id or channel_name" },
        { status: 400 }
      );
    }

    // Handle global presence channel (for online status)
    if (channelName === "presence-global") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          image: true,
          personalInfo: {
            select: {
              firstName: true,
              lastName: true,
              profilePicture: true,
            },
          },
        },
      });

      const presenceData = {
        user_id: session.user.id,
        user_info: {
          id: user?.id,
          name: user?.personalInfo?.firstName || user?.name || "Unknown",
          image: user?.personalInfo?.profilePicture || user?.image,
        },
      };

      const authResponse = pusherServer.authorizeChannel(
        socketId,
        channelName,
        presenceData
      );
      return NextResponse.json(authResponse);
    }

    // Handle private conversation channels
    if (channelName.startsWith("private-conversation-")) {
      const conversationId = channelName.replace("private-conversation-", "");

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
          { error: "Not authorized for this conversation" },
          { status: 403 }
        );
      }

      const authResponse = pusherServer.authorizeChannel(socketId, channelName);
      return NextResponse.json(authResponse);
    }

    // Handle private user channels (for notifications)
    if (channelName.startsWith("private-user-")) {
      const userId = channelName.replace("private-user-", "");

      if (userId !== session.user.id) {
        return NextResponse.json(
          { error: "Not authorized for this channel" },
          { status: 403 }
        );
      }

      const authResponse = pusherServer.authorizeChannel(socketId, channelName);
      return NextResponse.json(authResponse);
    }

    // Handle presence channels for conversations
    if (channelName.startsWith("presence-conversation-")) {
      const conversationId = channelName.replace("presence-conversation-", "");

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
          { error: "Not authorized for this conversation" },
          { status: 403 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          image: true,
          personalInfo: {
            select: {
              firstName: true,
              lastName: true,
              profilePicture: true,
            },
          },
        },
      });

      const presenceData = {
        user_id: session.user.id,
        user_info: {
          id: user?.id,
          name: user?.personalInfo?.firstName || user?.name || "Unknown",
          image: user?.personalInfo?.profilePicture || user?.image,
        },
      };

      const authResponse = pusherServer.authorizeChannel(
        socketId,
        channelName,
        presenceData
      );
      return NextResponse.json(authResponse);
    }

    return NextResponse.json(
      { error: "Unknown channel type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Pusher auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
