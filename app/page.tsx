// Purpose: Renders the public homepage entry route.
import { PublicHomeShell } from "@/components/public-home/PublicHomeShell";
import { getInitialLanguage } from "@/lib/i18n/getInitialLanguage";

export default async function HomePage() {
  const initialLanguage = await getInitialLanguage();

  return <PublicHomeShell initialLanguage={initialLanguage} />;
}
