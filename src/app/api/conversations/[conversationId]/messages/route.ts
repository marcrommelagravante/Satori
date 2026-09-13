import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getMessages, getConversation } from "@/lib/chat";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await requireAuth();
    const { conversationId } = await params;

    const conv = await getConversation(conversationId, user.id);
    if (!conv) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Conversation not found or unauthorized",
          },
        },
        { status: 404 }
      );
    }

    const data = await getMessages(conversationId, user.id);
    return NextResponse.json({ data, error: null });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "UNAUTHORIZED",
          message:
            error instanceof Error ? error.message : "Failed to fetch messages",
        },
      },
      { status: 401 }
    );
  }
}
