"use client";

import * as React from "react";
import {
  Building2,
  SlidersHorizontal,
  Users,
  Puzzle,
  Bell,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteWorkspaceSection } from "@/app/(dashboard)/settings/delete-workspace-section";

interface SettingsViewProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  activeWorkspace: {
    id: string;
    name: string;
    slug: string;
    role: string;
  };
}

export function SettingsView({ user, activeWorkspace }: SettingsViewProps) {
  const [activeCategory, setActiveCategory] = React.useState<string | null>("general");

  const categories = [
    {
      id: "general",
      title: "General",
      description: "Workspace name, description, and preferences",
      icon: SlidersHorizontal,
    },
    {
      id: "members",
      title: "Members",
      description: "Invite and manage team members",
      icon: Users,
    },
    {
      id: "integrations",
      title: "Integrations",
      description: "Connect to external tools and services",
      icon: Puzzle,
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Email and in-app notifications",
      icon: Bell,
    },
    {
      id: "security",
      title: "Security",
      description: "Authentication and data protection",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12" data-density="medium">
      {/* Header matching Mockup Panel 8 */}
      <div className="pb-2">
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          Manage your workspace, preferences, and account.
        </p>
      </div>

      {/* Top Workspace Card matching Mockup Panel 8 */}
      <div className="rounded-[10px] border border-border/80 bg-card p-4 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Workspace
            </div>
            <div className="font-heading text-sm font-bold text-foreground">
              {activeWorkspace.name}
            </div>
            <div className="text-xs text-muted-foreground capitalize">
              {activeWorkspace.role}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveCategory("general")}
          className="rounded-[6px] text-xs h-8"
        >
          Manage
        </Button>
      </div>

      {/* Category List Rows */}
      <div className="space-y-2.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isExpanded = activeCategory === cat.id;

          return (
            <div
              key={cat.id}
              className={`rounded-[10px] border bg-card transition-all overflow-hidden ${
                isExpanded ? "border-primary/50 shadow-2xs" : "border-border/80 hover:border-border"
              }`}
            >
              <button
                onClick={() => setActiveCategory(isExpanded ? null : cat.id)}
                className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-muted/70 text-foreground">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xs font-semibold text-foreground">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">{cat.description}</p>
                  </div>
                </div>

                <div className="text-muted-foreground">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </button>

              {/* Expanded Category Pane */}
              {isExpanded && (
                <div className="p-5 border-t border-border/60 bg-muted/10 text-xs space-y-4 animate-in fade-in-50 duration-150">
                  {cat.id === "general" && (
                    <div className="space-y-3 max-w-lg">
                      <div>
                        <label className="font-medium text-foreground block mb-1">
                          Workspace Name
                        </label>
                        <input
                          type="text"
                          defaultValue={activeWorkspace.name}
                          readOnly
                          className="w-full h-8 px-3 rounded-[6px] border border-border bg-background text-xs text-foreground"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-foreground block mb-1">
                          Workspace Slug
                        </label>
                        <input
                          type="text"
                          defaultValue={activeWorkspace.slug}
                          readOnly
                          className="w-full h-8 px-3 rounded-[6px] border border-border bg-background text-xs font-mono text-muted-foreground"
                        />
                      </div>
                      <div className="pt-2">
                        <label className="font-medium text-foreground block mb-1">
                          User Account
                        </label>
                        <p className="text-muted-foreground">
                          Signed in as <strong>{user.name}</strong> ({user.email})
                        </p>
                      </div>
                    </div>
                  )}

                  {cat.id === "members" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">Active Members (1)</span>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          + Invite Member
                        </Button>
                      </div>
                      <div className="p-3 rounded-lg border border-border bg-card flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                            {user.name?.substring(0, 1).toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{user.name}</p>
                            <p className="text-[11px] text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold capitalize">
                          {activeWorkspace.role}
                        </span>
                      </div>
                    </div>
                  )}

                  {cat.id === "integrations" && (
                    <div className="space-y-2">
                      <p className="text-muted-foreground">
                        Connect Satori to your external cloud knowledge repositories.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-lg border border-border bg-card flex items-center justify-between">
                          <span className="font-medium text-foreground">Google Drive</span>
                          <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-semibold">
                            Coming Soon
                          </span>
                        </div>
                        <div className="p-3 rounded-lg border border-border bg-card flex items-center justify-between">
                          <span className="font-medium text-foreground">Notion</span>
                          <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-semibold">
                            Coming Soon
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {cat.id === "notifications" && (
                    <div className="space-y-2 max-w-md">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-border text-primary"
                        />
                        <span className="text-foreground">
                          Email notifications for document ingestion completions
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-border text-primary"
                        />
                        <span className="text-foreground">
                          Alerts when report generation completes
                        </span>
                      </label>
                    </div>
                  )}

                  {cat.id === "security" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          Tenant Isolation
                        </h4>
                        <p className="text-muted-foreground">
                          All embeddings, chunks, and citations are strictly scoped to workspace{" "}
                          <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">
                            {activeWorkspace.id}
                          </code>
                          .
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border">
                        <DeleteWorkspaceSection
                          workspaceId={activeWorkspace.id}
                          workspaceName={activeWorkspace.name}
                          userRole={activeWorkspace.role}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
