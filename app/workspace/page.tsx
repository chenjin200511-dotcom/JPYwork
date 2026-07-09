// Purpose: Renders the authenticated workspace dashboard.
import { WorkspaceAppShell } from "@/components/workspace/app/WorkspaceAppShell";
import { WorkspaceDashboard } from "@/components/workspace/app/WorkspaceDashboard";
import { getInitialLanguage } from "@/lib/i18n/getInitialLanguage";

export default async function WorkspacePage() {
  const initialLanguage = await getInitialLanguage();

  return (
    <WorkspaceAppShell initialLanguage={initialLanguage}>
      <WorkspaceDashboard />
    </WorkspaceAppShell>
  );
}
