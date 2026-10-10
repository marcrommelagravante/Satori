import { requireAuth } from "@/lib/auth/session";
import { getUserWorkspaces } from "@/lib/workspaces/service";
import { SettingsView } from "@/components/settings/settings-view";
import { getAiEngineInfo } from "@/lib/ai/info";
import { redirect } from "next/navigation";

interface SettingsPageProps {
  searchParams: Promise<{ ws?: string }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const user = await requireAuth();
  const params = await searchParams;
  const workspaces = await getUserWorkspaces(user.id);

  if (workspaces.length === 0) {
    redirect("/workspaces/new");
  }

  const activeWorkspace =
    (params.ws && workspaces.find((w) => w.id === params.ws)) || workspaces[0];

  const aiEngine = getAiEngineInfo();

  return (
    <SettingsView
      user={user}
      activeWorkspace={activeWorkspace}
      aiEngine={aiEngine}
    />
  );
}

