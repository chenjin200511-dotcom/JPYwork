// Purpose: Renders the Owner-only system configuration route.
import { WorkspaceAppShell } from "@/components/workspace/app/WorkspaceAppShell";
import { WorkspaceSystemSettingsPage } from "@/components/workspace/app/WorkspaceSystemSettingsPage";
import { getInitialLanguage } from "@/lib/i18n/getInitialLanguage";

export default async function SystemSettingsPage() {
  const initialLanguage = await getInitialLanguage();

  return (
    <WorkspaceAppShell initialLanguage={initialLanguage}>
      <WorkspaceSystemSettingsPage />
    </WorkspaceAppShell>
  );
}
