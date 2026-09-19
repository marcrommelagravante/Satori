import { requireAuth } from "@/lib/auth/session";
import { getUserWorkspaces } from "@/lib/workspaces/service";
import { createWorkspaceAction } from "@/app/actions/workspaces";
import { Building2, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewWorkspacePage() {
  const user = await requireAuth();
  const existingWorkspaces = await getUserWorkspaces(user.id);
  const hasExisting = existingWorkspaces.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-12">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-sm">
          悟
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-xl tracking-tight text-foreground">
            Satori
          </span>
          <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-semibold text-secondary flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> AI
          </span>
        </div>
      </div>

      <div className="w-full max-w-lg space-y-4">
        {hasExisting && (
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground mb-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Dashboard
            </Link>
          </Button>
        )}

        <Card className="border-border shadow-lg">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
              <Building2 className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl">
              {hasExisting ? "Create a New Workspace" : "Create Your First Workspace"}
            </CardTitle>
            <CardDescription>
              {hasExisting
                ? "Add another isolated knowledge space for a different team, client, or department."
                : "Welcome to Satori! Create an organization or project workspace to start ingesting documents and running grounded AI."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createWorkspaceAction} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-muted-foreground">
                  Workspace Name
                </label>
                <Input
                  name="name"
                  placeholder="e.g. Acme Legal, Student Council, Q3 Research"
                  required
                  minLength={2}
                  maxLength={50}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-muted-foreground">
                  Custom Slug (Optional)
                </label>
                <Input
                  name="slug"
                  placeholder="e.g. acme-legal"
                  maxLength={40}
                />
                <p className="text-[11px] text-muted-foreground">
                  URL-friendly identifier. If left empty, a unique slug will be generated automatically.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                {hasExisting && (
                  <Button asChild variant="outline">
                    <Link href="/dashboard">Cancel</Link>
                  </Button>
                )}
                <Button type="submit">
                  Create Workspace
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
