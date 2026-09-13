import { NextResponse } from "next/server";
import { requireWorkspaceMember } from "@/lib/workspaces/guard";
import { getConversations, createConversation } from "@/lib/chat";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const { user } = await requireWorkspaceMember(workspaceId, "member");
    const data = await getConversations(workspaceId, user.id);
    return NextResponse.json({ data, error: null });
  } catch (error) {
    const status =
      error && typeof error === "object" && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 401;

    return NextResponse.json(
      {
        data: null,
        error: {
          code: status === 404 ? "NOT_FOUND" : "UNAUTHORIZED",
          message:
            error instanceof Error ? error.message : "Failed to fetch conversations",
        },
      },
      { status }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const { user } = await requireWorkspaceMember(workspaceId, "member");

    let title = "New Conversation";
    try {
      const body = await request.json();
      if (body.title && typeof body.title === "string") {
        title = body.title.trim();
      }
    } catch {
      // Body is optional
    }

    const data = await createConversation(workspaceId, user.id, title);
    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (error) {
    const status =
      error && typeof error === "object" && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 401;

    return NextResponse.json(
      {
        data: null,
        error: {
          code: "SERVER_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to create conversation",
        },
      },
      { status }
    );
  }
}
