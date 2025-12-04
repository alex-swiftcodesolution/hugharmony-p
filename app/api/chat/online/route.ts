import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher-server";

// POST - Mark user as online/offline
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isOnline } = await req.json();

    // Broadcast to all subscribers
    await pusherServer.trigger(
      "presence-global",
      isOnline ? "user-online" : "user-offline",
      {
        userId: session.user.id,
        timestamp: new Date().toISOString(),
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating online status:", error);
    return NextResponse.json(
      { error: "Failed to update online status" },
      { status: 500 }
    );
  }
}
