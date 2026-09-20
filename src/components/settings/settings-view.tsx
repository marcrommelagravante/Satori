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
    <div className="space-y-5 md:space-y-6 w-full pb-12" data-density="medium">
      {/* Header matching Image 1 */}
      <div>
        <h1 className="font-heading text-2xl md:text-[28px] font-bold tracking-tight text-slate-900 dark:text-foreground">
          Settings
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-muted-foreground mt-0.5">
          Manage your workspace, preferences, and account.
        </p>
      </div>

      {/* Top Workspace Card matching Image 1 */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-muted-foreground">
              Workspace
            </div>
            <div className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-foreground">
              {activeWorkspace.name}
            </div>
            <div className="text-xs text-slate-400 dark:text-muted-foreground capitalize">
              {activeWorkspace.role}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveCategory(activeCategory === "general" ? null : "general")}
          className="rounded-xl sm:rounded-2xl bg-[#EEF2FF] hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-[#4F46E5] dark:text-indigo-400 font-semibold text-xs sm:text-sm px-6 py-2.5 transition-all cursor-pointer shadow-2xs"
        >
          Manage
        </button>
      </div>

      {/* Unified Grouped Categories Card matching Image 1 */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-border/80 bg-white dark:bg-card shadow-xs overflow-hidden divide-y divide-slate-100 dark:divide-border/60">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isExpanded = activeCategory === cat.id;

          return (
            <div key={cat.id} className="transition-colors">
              <button
                type="button"
                onClick={() => setActiveCategory(isExpanded ? null : cat.id)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-muted/30 cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 shrink-0 transition-transform group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground group-hover:text-[#4F46E5] dark:group-hover:text-indigo-400 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 dark:text-muted-foreground pr-1">
                  <ChevronRight
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isExpanded
                        ? "rotate-90 text-[#4F46E5] dark:text-indigo-400"
                        : "group-hover:translate-x-0.5"
                    }`}
                  />
                </div>
              </button>

              {/* Expanded Category Pane */}
              {isExpanded && (
                <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-border/60 bg-slate-50/50 dark:bg-muted/10 text-xs space-y-4 animate-in fade-in-50 duration-150">
                  {cat.id === "general" && (
                    <div className="space-y-4 max-w-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Workspace Name
                          </label>
                          <input
                            type="text"
                            defaultValue={activeWorkspace.name}
                            readOnly
                            className="w-full h-9 px-3.5 rounded-xl border border-slate-200/80 dark:border-border bg-white dark:bg-background text-xs text-slate-900 dark:text-foreground focus:outline-none focus:border-[#4F46E5]"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Workspace Slug
                          </label>
                          <input
                            type="text"
                            defaultValue={activeWorkspace.slug}
                            readOnly
                            className="w-full h-9 px-3.5 rounded-xl border border-slate-200/80 dark:border-border bg-white dark:bg-background text-xs font-mono text-slate-500 dark:text-muted-foreground focus:outline-none focus:border-[#4F46E5]"
                          />
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-100 dark:border-border/40">
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          User Account
                        </label>
                        <p className="text-slate-500 dark:text-muted-foreground">
                          Signed in as <strong className="text-slate-900 dark:text-foreground">{user.name}</strong> ({user.email})
                        </p>
                      </div>
                    </div>
                  )}

                  {cat.id === "members" && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Active Members (1)</span>
                        <Button size="sm" className="rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white h-8 text-xs font-semibold px-3.5 shadow-2xs cursor-pointer">
                          + Invite Member
                        </Button>
                      </div>
                      <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-border bg-white dark:bg-card flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[#EEF2FF] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                            {user.name?.substring(0, 1).toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-foreground">{user.name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 px-2.5 py-0.5 text-[10px] font-semibold capitalize">
                          {activeWorkspace.role}
                        </span>
                      </div>
                    </div>
                  )}

                  {cat.id === "integrations" && (
                    <div className="space-y-2">
                      <p className="text-slate-500 dark:text-muted-foreground">
                        Connect Satori to your external cloud knowledge repositories.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-border bg-white dark:bg-card flex items-center justify-between shadow-2xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Google Drive</span>
                          <span className="text-[10px] bg-slate-100 dark:bg-muted px-2 py-0.5 rounded-full text-slate-500 dark:text-muted-foreground font-semibold">
                            Coming Soon
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-border bg-white dark:bg-card flex items-center justify-between shadow-2xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Notion</span>
                          <span className="text-[10px] bg-slate-100 dark:bg-muted px-2 py-0.5 rounded-full text-slate-500 dark:text-muted-foreground font-semibold">
                            Coming Soon
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {cat.id === "notifications" && (
                    <div className="space-y-2.5 max-w-md">
                      <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded text-[#4F46E5] focus:ring-[#4F46E5] h-4 w-4"
                        />
                        <span>
                          Email notifications for document ingestion completions
                        </span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded text-[#4F46E5] focus:ring-[#4F46E5] h-4 w-4"
                        />
                        <span>
                          Alerts when report generation completes
                        </span>
                      </label>
                    </div>
                  )}

                  {cat.id === "security" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-foreground mb-1">
                          Tenant Isolation
                        </h4>
                        <p className="text-slate-500 dark:text-muted-foreground">
                          All embeddings, chunks, and citations are strictly scoped to workspace{" "}
                          <code className="bg-slate-100 dark:bg-muted px-1.5 py-0.5 rounded font-mono text-[11px] text-slate-700 dark:text-slate-300">
                            {activeWorkspace.id}
                          </code>
                          .
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-border/60">
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
