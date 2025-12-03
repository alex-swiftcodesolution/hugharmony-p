import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET all conversations for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
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
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Transform to include unread count
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find(
          (p) => p.userId === session.user?.id
        );

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: session.user?.id },
            createdAt: { gt: participant?.lastReadAt || new Date(0) },
          },
        });

        return {
          ...conv,
          unreadCount,
        };
      })
    );

    return NextResponse.json(conversationsWithUnread);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST create a new conversation
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { participantIds, name, isGroup = false } = await req.json();

    if (
      !participantIds ||
      !Array.isArray(participantIds) ||
      participantIds.length === 0
    ) {
      return NextResponse.json(
        { error: "At least one participant is required" },
        { status: 400 }
      );
    }

    // Include current user in participants
    const allParticipantIds = [
      ...new Set([session.user.id, ...participantIds]),
    ];

    // For 1-on-1 chats, check if conversation already exists
    if (!isGroup && allParticipantIds.length === 2) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          isGroup: false,
          AND: allParticipantIds.map((id) => ({
            participants: {
              some: { userId: id },
            },
          })),
          participants: {
            every: {
              userId: { in: allParticipantIds },
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

      if (existingConversation) {
        return NextResponse.json(existingConversation);
      }
    }

    // Validate all participant IDs exist
    const users = await prisma.user.findMany({
      where: { id: { in: allParticipantIds } },
    });

    if (users.length !== allParticipantIds.length) {
      return NextResponse.json(
        { error: "One or more users not found" },
        { status: 404 }
      );
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        name: isGroup ? name : null,
        isGroup,
        participants: {
          create: allParticipantIds.map((userId) => ({
            userId,
          })),
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

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
