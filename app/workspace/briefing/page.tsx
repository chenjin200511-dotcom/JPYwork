// Purpose: Renders the workspace daily briefing route.
import { WorkspaceAppShell } from "@/components/workspace/app/WorkspaceAppShell";
import { WorkspaceBriefingPage } from "@/components/workspace/app/WorkspaceModulePages";
import { getInitialLanguage } from "@/lib/i18n/getInitialLanguage";

export default async function BriefingPage() {
  const initialLanguage = await getInitialLanguage();

  return (
    <WorkspaceAppShell initialLanguage={initialLanguage}>
      <WorkspaceBriefingPage />
    </WorkspaceAppShell>
  );
}
