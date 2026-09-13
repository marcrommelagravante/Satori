import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { deleteConversation, getConversation } from "@/lib/chat";

export async function DELETE(
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

    const deleted = await deleteConversation(conversationId, user.id);
    return NextResponse.json({ data: { success: deleted }, error: null });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to delete conversation",
        },
      },
      { status: 500 }
    );
  }
}
