import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserWorkspaces } from "@/lib/workspaces/service";
import { WorkspaceSwitcher } from "@/components/shared/workspace-switcher";
import { SidebarNav } from "@/components/shared/sidebar-nav";
import { TopNav } from "@/components/shared/top-nav";
import { SatoriLogo } from "@/components/shared/satori-logo";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const workspaces = await getUserWorkspaces(user.id);
  if (workspaces.length === 0) {
    redirect("/workspaces/new");
  }

  const currentWorkspace = workspaces[0];

  return (
    <div className="min-h-screen flex bg-[#EEF2F6] dark:bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="w-60 border-r border-slate-200/70 dark:border-border/70 bg-white dark:bg-card flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-200/70 dark:border-border/70 flex items-center justify-between">
          <Link href="/dashboard" className="group">
            <SatoriLogo size={28} showWordmark={true} />
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <SidebarNav workspaceId={currentWorkspace.id} />
        </div>

        {/* Workspace Switcher Docked at Bottom */}
        <div className="p-3 border-t border-slate-200/70 dark:border-border/70 bg-white dark:bg-card">
          <WorkspaceSwitcher
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <TopNav
          user={user}
          workspaceName={currentWorkspace.name}
          workspaceRole={currentWorkspace.role}
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#EEF2F6] dark:bg-background">{children}</main>
      </div>
    </div>
  );
}
