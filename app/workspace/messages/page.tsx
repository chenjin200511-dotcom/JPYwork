// Purpose: Renders the workspace customer messages route.
import { WorkspaceAppShell } from "@/components/workspace/app/WorkspaceAppShell";
import { WorkspaceMessagesPage } from "@/components/workspace/app/WorkspaceModulePages";
import { getInitialLanguage } from "@/lib/i18n/getInitialLanguage";

export default async function MessagesPage() {
  const initialLanguage = await getInitialLanguage();

  return (
    <WorkspaceAppShell initialLanguage={initialLanguage}>
      <WorkspaceMessagesPage />
    </WorkspaceAppShell>
  );
}
