import { requireAuth } from "@/lib/auth/session";
import { createWorkspaceAction } from "@/app/actions/workspaces";
import { Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewWorkspacePage() {
  await requireAuth();

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Dashboard
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
            <Building2 className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl">Create a New Workspace</CardTitle>
          <CardDescription>
            Each workspace provides strict tenant isolation for documents, chunks, pgvector embeddings, and AI chat sessions.
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
              <Button asChild variant="outline">
                <Link href="/dashboard">Cancel</Link>
              </Button>
              <Button type="submit">
                Create Workspace
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
