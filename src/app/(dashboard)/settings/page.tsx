import { requireAuth } from "@/lib/auth/session";
import { getUserWorkspaces } from "@/lib/workspaces/service";
import { Settings, Shield, User, Building } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteWorkspaceSection } from "./delete-workspace-section";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ws?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const workspaces = await getUserWorkspaces(user.id);
  const activeWorkspace =
    (params.ws && workspaces.find((w) => w.id === params.ws)) || workspaces[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and workspace configurations.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">User Profile</CardTitle>
            </div>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-foreground">{user.name || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium text-foreground">{user.email}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-muted-foreground">User ID</span>
              <code className="text-xs bg-muted px-2 py-0.5 rounded text-foreground">{user.id}</code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Active Workspace</CardTitle>
            </div>
            <CardDescription>Multi-tenant organization boundary settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border text-sm">
              <span className="text-muted-foreground">Workspace Name</span>
              <span className="font-medium text-foreground">{activeWorkspace?.name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border text-sm">
              <span className="text-muted-foreground">Slug</span>
              <code className="text-xs bg-muted px-2 py-0.5 rounded text-foreground">{activeWorkspace?.slug}</code>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-muted-foreground">Your Role</span>
              <Badge variant="outline" className="capitalize">
                <Shield className="h-3 w-3 mr-1 text-primary" />
                {activeWorkspace?.role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {activeWorkspace && (
          <DeleteWorkspaceSection
            workspaceId={activeWorkspace.id}
            workspaceName={activeWorkspace.name}
            userRole={activeWorkspace.role}
          />
        )}
      </div>
    </div>
  );
}
