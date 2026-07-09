// Purpose: Renders the workspace approvals route.
import { WorkspaceAppShell } from "@/components/workspace/app/WorkspaceAppShell";
import { WorkspaceApprovalsPage } from "@/components/workspace/app/WorkspaceModulePages";
import { getInitialLanguage } from "@/lib/i18n/getInitialLanguage";

export default async function ApprovalsPage() {
  const initialLanguage = await getInitialLanguage();

  return (
    <WorkspaceAppShell initialLanguage={initialLanguage}>
      <WorkspaceApprovalsPage />
    </WorkspaceAppShell>
  );
}
