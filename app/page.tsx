"use client";

import { ToastProvider } from "@/app/components/common/Toast";
import { ProjectDraftProvider } from "@/app/lib/client/project-draft-context";
import { WorkspaceShell } from "@/app/components/workspace/WorkspaceShell";

export default function HomePage() {
  return (
    <ToastProvider>
      <ProjectDraftProvider>
        <WorkspaceShell />
      </ProjectDraftProvider>
    </ToastProvider>
  );
}
