// Purpose: Defines editable content JSON shapes used by the site and workspace loaders.
import type { Dictionary, Language, SiteBlock } from "@/lib/i18n/dictionary";

export type { Language, SiteBlock };

export type SiteContent = Omit<Dictionary, "workspace"> & {
  blocks: SiteBlock[];
  brand: {
    name: string;
    subtitle: string;
  };
  nav: {
    overview: string;
    workflow: string;
    shopee: string;
    pricing: string;
    workspace: string;
    login: string;
    menu: string;
  };
};

export type WorkspaceContent = Dictionary["workspace"];
