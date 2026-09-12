import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getUserWorkspaces,
  getOrCreateDefaultWorkspace,
} from "@/lib/workspaces/service";
import { WorkspaceSwitcher } from "@/components/shared/workspace-switcher";
import { SidebarNav } from "@/components/shared/sidebar-nav";
import { UserNav } from "@/components/shared/user-nav";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  let workspaces = await getUserWorkspaces(user.id);
  if (workspaces.length === 0) {
    const defaultWorkspace = await getOrCreateDefaultWorkspace(user);
    workspaces = [defaultWorkspace];
  }

  const currentWorkspace = workspaces[0];

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-xs transition-transform group-hover:scale-105">
              悟
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-foreground">
                Satori
              </span>
              <span className="rounded-full bg-secondary/15 px-1.5 py-0.2 text-[10px] font-semibold text-secondary flex items-center gap-0.5">
                <Sparkles className="h-2.5 w-2.5" /> AI
              </span>
            </div>
          </Link>
        </div>

        {/* Workspace Switcher */}
        <div className="p-3 border-b border-border/60">
          <WorkspaceSwitcher
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
          />
        </div>

        {/* Navigation */}
        <div className="flex-1 p-3 overflow-y-auto">
          <SidebarNav workspaceId={currentWorkspace.id} />
        </div>

        {/* User profile & Theme footer */}
        <div className="p-3 bg-muted/30">
          <UserNav user={user} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
