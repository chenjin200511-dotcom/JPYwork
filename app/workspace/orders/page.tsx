// Purpose: Renders the workspace orders route.
import { WorkspaceAppShell } from "@/components/workspace/app/WorkspaceAppShell";
import { WorkspaceOrdersPage } from "@/components/workspace/app/WorkspaceModulePages";
import { getInitialLanguage } from "@/lib/i18n/getInitialLanguage";

export default async function OrdersPage() {
  const initialLanguage = await getInitialLanguage();

  return (
    <WorkspaceAppShell initialLanguage={initialLanguage}>
      <WorkspaceOrdersPage />
    </WorkspaceAppShell>
  );
}
