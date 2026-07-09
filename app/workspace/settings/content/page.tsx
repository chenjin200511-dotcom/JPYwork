// Purpose: Renders the owner-only content management route.
import { WorkspaceAppShell } from "@/components/workspace/app/WorkspaceAppShell";
import { WorkspaceContentSettingsPage } from "@/components/workspace/app/WorkspaceModulePages";
import { getInitialLanguage } from "@/lib/i18n/getInitialLanguage";

export default async function ContentSettingsPage() {
  const initialLanguage = await getInitialLanguage();

  return (
    <WorkspaceAppShell initialLanguage={initialLanguage}>
      <WorkspaceContentSettingsPage />
    </WorkspaceAppShell>
  );
}
