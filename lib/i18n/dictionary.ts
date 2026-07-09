// Purpose: Provides the local Chinese and English copy for the JPY team interface.
import { getSiteContent } from "@/lib/content/getSiteContent";
import { getWorkspaceContent } from "@/lib/content/getWorkspaceContent";

export type Language = "zh" | "en";

export type SystemVisualNodeKey =
  | "shopee"
  | "tasks"
  | "messages"
  | "orders"
  | "inventory"
  | "pricing"
  | "finance"
  | "miaoshou"
  | "tiktok";

export type HomeSectionCard = {
  label: string;
  title: string;
  description: string;
};

export type HomeRoleCard = {
  label: string;
  title: string;
  description: string;
};

export type ProductHomeCard = {
  title: string;
  description: string;
  metric?: string;
  items?: string[];
};

export type SiteBlockItem = {
  description?: string;
  items?: string[];
  metric?: string;
  size: "large" | "medium" | "small" | "wide" | "tall";
  title: string;
  visual?: string;
};

export type SiteBlock = {
  center?: string;
  dashboard?: {
    sidebar: string[];
    kpi: string[];
    tasks: string[];
    chartLabel: string;
  };
  enabled: boolean;
  id: string;
  items?: SiteBlockItem[];
  layout: string;
  primaryCta?: string;
  secondaryCta?: string;
  subtitle?: string;
  title: string;
  type: "hero" | "feature-mosaic" | "showcase" | "roles" | "cta";
};

export type Dictionary = {
  blocks: SiteBlock[];
  brand: {
    name: string;
    subtitle: string;
  };
  common: {
    teamName: string;
    teamShortName: string;
    teamWorkspace: string;
    login: string;
    language: string;
    scrollToExplore: string;
  };
  loading: {
    initializing: string;
    teamSystem: string;
    shopeeFirst: string;
    miaoshouBridge: string;
    remoteOps: string;
  };
  corners: {
    brandTitle: string;
    brandSubtitle: string;
    loginTitle: string;
    loginSubtitle: string;
    shopeeTitle: string;
    shopeeSubtitle: string;
    miaoshouTitle: string;
    miaoshouSubtitle: string;
  };
  hero: {
    title: string;
    subtitle: string;
    labels: string[];
    primaryAction: string;
    secondaryAction: string;
  };
  systemVisual: {
    centerNode: string;
    nodes: Record<SystemVisualNodeKey, string>;
  };
  publicSections: {
    workflow: {
      title: string;
      description: string;
      cards: HomeSectionCard[];
    };
    shopee: {
      title: string;
      cards: HomeSectionCard[];
    };
    tiktok: {
      title: string;
      cards: HomeSectionCard[];
    };
    miaoshou: {
      title: string;
      description: string;
      cards: HomeSectionCard[];
    };
    roles: {
      title: string;
      cards: HomeRoleCard[];
    };
    footer: {
      title: string;
      note: string;
    };
  };
  productHome: {
    hero: {
      title: string;
      subtitle: string;
      primaryAction: string;
      secondaryAction: string;
    };
    dashboard: {
      sidebar: string[];
      kpi: string[];
      tasks: string[];
      chartLabel: string;
    };
    featureMosaic: {
      title: string;
      cards: {
        shopeeControl: ProductHomeCard;
        messages: ProductHomeCard;
        pricing: ProductHomeCard;
        miaoshouBridge: ProductHomeCard;
        inventory: ProductHomeCard;
        orders: ProductHomeCard;
        finance: ProductHomeCard;
      };
    };
    shopeeHero: {
      title: string;
      subtitle: string;
      steps: string[];
    };
    tiktokReady: {
      title: string;
      subtitle: string;
      modules: string[];
    };
    miaoshouBridge: {
      title: string;
      subtitle: string;
      center: string;
      flows: string[];
    };
    roles: {
      title: string;
      owner: ProductHomeCard;
      operator: ProductHomeCard;
      support: ProductHomeCard;
    };
    finalCta: {
      title: string;
      action: string;
    };
  };
  section: {
    workflow: string;
    shopee: string;
    tiktok: string;
    miaoshou: string;
    roles: string;
  };
  navigation: {
    overview: string;
    shopee: string;
    workflow: string;
    pricing: string;
    workspace: string;
    menu: string;
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
  auth: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    rememberDevice: string;
    signIn: string;
    invalidCredentials: string;
    close: string;
  };
  workspace: {
    workspaceTitle: string;
    workspaceSubtitle: string;
    authRequiredTitle: string;
    authRequiredSubtitle: string;
    consoleEyebrow: string;
    currentTeam: string;
    currentRole: string;
    currentLanguage: string;
    languageZh: string;
    languageEn: string;
    signOut: string;
    sidebarLabel: string;
    metricsLabel: string;
    operationsStatusTitle: string;
    operationsStatusSubtitle: string;
    workspacePreviewTitle: string;
    workspacePreviewSubtitle: string;
    previewLabels: string[];
    reservedLabel: string;
    loadingLabel: string;
    dashboardError: string;
    homeLink: string;
    contentSettings: string;
    contentSettingsTitle: string;
    contentSettingsSubtitle: string;
    ownerOnly: string;
    sidebarModules: string[];
    metrics: string[];
    dashboard: string;
    tasks: string;
    messages: string;
    orders: string;
    inventory: string;
    pricing: string;
    financeTax: string;
    apiCenter: string;
    settings: string;
  };
};

export const dictionary: Record<Language, Dictionary> = {
  en: {
    ...getSiteContent("en"),
    workspace: getWorkspaceContent("en"),
  },
  zh: {
    ...getSiteContent("zh"),
    workspace: getWorkspaceContent("zh"),
  },
};
