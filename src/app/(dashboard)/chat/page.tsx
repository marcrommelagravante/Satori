import { requireAuth } from "@/lib/auth/session";
import { getUserWorkspaces } from "@/lib/workspaces/service";
import { getConversations, getMessages } from "@/lib/chat";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { ChatContainer } from "./chat-container";
import { redirect } from "next/navigation";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ ws?: string; conv?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const workspaces = await getUserWorkspaces(user.id);

  if (workspaces.length === 0) {
    redirect("/workspaces/new");
  }

  const activeWorkspace =
    (params.ws && workspaces.find((w) => w.id === params.ws)) || workspaces[0];

  // Fetch conversations for this workspace and user
  const initialConversations = await getConversations(
    activeWorkspace.id,
    user.id
  );

  const initialConversationId =
    params.conv || (initialConversations.length > 0 ? initialConversations[0].id : null);

  // If there is an active conversation, pre-fetch its messages
  const initialMessages = initialConversationId
    ? await getMessages(initialConversationId, user.id)
    : [];

  // Fetch ready workspace documents available for scoping
  const initialDocuments = await db
    .select({
      id: documents.id,
      name: documents.name,
      category: documents.category,
      status: documents.status,
      fileSize: documents.sizeBytes,
      mimeType: documents.mimeType,
    })
    .from(documents)
    .where(
      and(
        eq(documents.workspaceId, activeWorkspace.id),
        eq(documents.status, "ready")
      )
    )
    .orderBy(desc(documents.createdAt));

  return (
    <div className="w-full h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)] flex flex-col space-y-4">
      <ChatContainer
        workspaceId={activeWorkspace.id}
        workspaceName={activeWorkspace.name}
        initialConversations={initialConversations}
        initialConversationId={initialConversationId}
        initialMessages={initialMessages}
        initialDocuments={initialDocuments}
      />
    </div>
  );
}

