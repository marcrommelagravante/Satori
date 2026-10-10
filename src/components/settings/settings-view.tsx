"use client";

import * as React from "react";
import { WorkspaceCard } from "./workspace-card";
import { AccountCard } from "./account-card";
import { AiEngineCard } from "./ai-engine-card";
import { DeleteWorkspaceSection } from "@/app/(dashboard)/settings/delete-workspace-section";
import type { AiEngineInfo } from "@/lib/ai/info";

interface SettingsViewProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  activeWorkspace: {
    id: string;
    name: string;
    slug: string;
    role: string;
    createdAt?: Date;
  };
  aiEngine: AiEngineInfo;
}

export function SettingsView({
  user,
  activeWorkspace,
  aiEngine,
}: SettingsViewProps) {
  return (
    <div className="space-y-6 w-full pb-16" data-density="medium">
      {/* Settings Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-[28px] font-bold tracking-tight text-slate-900 dark:text-foreground">
          Settings
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-muted-foreground mt-0.5">
          Manage your workspace details, personal account, and AI retrieval configurations.
        </p>
      </div>

      {/* Stacked Cards Layout */}
      <div className="space-y-5">
        {/* 1. Workspace Identity & Rename */}
        <WorkspaceCard
          workspaceId={activeWorkspace.id}
          initialName={activeWorkspace.name}
          userRole={activeWorkspace.role}
          createdAt={activeWorkspace.createdAt}
        />

        {/* 2. Personal Account & Auth */}
        <AccountCard user={user} />

        {/* 3. AI Engine & Semantic Retrieval Architecture */}
        <AiEngineCard aiEngine={aiEngine} />

        {/* 4. Danger Zone (Delete Workspace) */}
        <DeleteWorkspaceSection
          workspaceId={activeWorkspace.id}
          workspaceName={activeWorkspace.name}
          userRole={activeWorkspace.role}
        />
      </div>
    </div>
  );
}
