"use client";

// Purpose: Provides the authenticated workspace layout, role-aware navigation, and shared context.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Language } from "@/lib/i18n/dictionary";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { apiRequest } from "@/lib/client/apiClient";
import { workspaceText, type WorkspaceCopy } from "./workspaceText";

export type WorkspaceRole = "OWNER" | "OPERATOR" | "SUPPORT";

export type WorkspaceUser = {
  email: string;
  id: string;
  name: string;
  role: WorkspaceRole;
};

type AuthMeResponse = {
  user: WorkspaceUser | null;
};

type WorkspaceContextValue = {
  copy: WorkspaceCopy;
  language: Language;
  reloadSession: () => void;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  user: WorkspaceUser;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspace() {
  const value = useContext(WorkspaceContext);

  if (!value) {
    throw new Error("useWorkspace must be used inside WorkspaceAppShell");
  }

  return value;
}

type NavItem = {
  href: string;
  key: keyof WorkspaceCopy["nav"];
  roles?: WorkspaceRole[];
};

const navItems: NavItem[] = [
  { href: "/workspace", key: "dashboard" },
  { href: "/workspace/tasks", key: "tasks" },
  { href: "/workspace/messages", key: "messages" },
  { href: "/workspace/orders", key: "orders" },
  { href: "/workspace/listings", key: "listings", roles: ["OWNER", "OPERATOR"] },
  { href: "/workspace/pricing", key: "pricing", roles: ["OWNER", "OPERATOR"] },
  { href: "/workspace/approvals", key: "approvals" },
  { href: "/workspace/inventory", key: "inventory", roles: ["OWNER", "OPERATOR"] },
  { href: "/workspace/briefing", key: "briefing" },
  { href: "/workspace/integrations", key: "integrations" },
  { href: "/workspace/settings/system", key: "system", roles: ["OWNER"] },
  { href: "/workspace/settings/content", key: "content", roles: ["OWNER"] },
  { href: "/workspace/audit", key: "audit", roles: ["OWNER"] },
];

function canSeeNavItem(user: WorkspaceUser, item: NavItem) {
  return !item.roles || item.roles.includes(user.role);
}

type WorkspaceAppShellProps = {
  children: ReactNode;
  initialLanguage: Language;
};

export function WorkspaceAppShell({
  children,
  initialLanguage,
}: WorkspaceAppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, toggleLanguage } = useLanguage(initialLanguage);
  const copy = useMemo(() => workspaceText[language], [language]);
  const [user, setUser] = useState<WorkspaceUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [sessionTick, setSessionTick] = useState(0);

  const reloadSession = useCallback(() => {
    setSessionTick((current) => current + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadSession() {
      setIsChecking(true);

      try {
        const data = await apiRequest<AuthMeResponse>("/api/auth/me");

        if (isActive) {
          setUser(data.user);
        }
      } catch {
        if (isActive) {
          setUser(null);
        }
      } finally {
        if (isActive) {
          setIsChecking(false);
        }
      }
    }

    void loadSession();

    return () => {
      isActive = false;
    };
  }, [sessionTick]);

  async function handleSignOut() {
    await apiRequest<{ signedOut: boolean }>("/api/auth/logout", {
      method: "POST",
    });
    setUser(null);
    router.push("/");
  }

  if (isChecking || !user) {
    return (
      <main className="workspace-app workspace-app--locked">
        <section className="workspace-lock-card">
          <p>{isChecking ? copy.auth.checking : language === "zh" ? "JPY 团队工作区" : "JPY Team Workspace"}</p>
          <h1>{isChecking ? "JPY" : copy.auth.lockedTitle}</h1>
          <span>{isChecking ? copy.common.loading : copy.auth.lockedSubtitle}</span>
          <Link className="workspace-pill-link" href="/">
            {copy.auth.home}
          </Link>
        </section>
      </main>
    );
  }

  const visibleNavItems = navItems.filter((item) => canSeeNavItem(user, item));
  const contextValue = {
    copy,
    language,
    reloadSession,
    setLanguage,
    toggleLanguage,
    user,
  } satisfies WorkspaceContextValue;

  return (
    <WorkspaceContext.Provider value={contextValue}>
      <main className="workspace-app">
        <aside
          className="workspace-sidebar"
          aria-label={language === "zh" ? "工作区模块" : "Workspace modules"}
        >
          <Link className="workspace-brand" href="/workspace">
            <strong>JPY</strong>
            <span>{language === "zh" ? "团队工作区" : "Team Workspace"}</span>
          </Link>

          <nav className="workspace-nav">
            {visibleNavItems.map((item) => {
              const isActive =
                item.href === "/workspace"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  className={`workspace-nav__item${isActive ? " is-active" : ""}`}
                  href={item.href}
                  key={item.href}
                >
                  {copy.nav[item.key]}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="workspace-shell">
          <header className="workspace-toolbar">
            <div>
              <p>{copy.common.currentTeam}: JPY</p>
              <h2>{copy.roles[user.role]}</h2>
            </div>
            <div className="workspace-toolbar__actions">
              <span>{user.email}</span>
              <button
                className="workspace-language"
                onClick={() => setLanguage(language === "zh" ? "en" : "zh")}
                type="button"
              >
                <b className={language === "zh" ? "is-active" : ""}>CN</b>
                <span>/</span>
                <b className={language === "en" ? "is-active" : ""}>EN</b>
              </button>
              <button className="workspace-text-button" onClick={handleSignOut} type="button">
                {copy.actions.signOut}
              </button>
            </div>
          </header>

          {children}
        </section>
      </main>
    </WorkspaceContext.Provider>
  );
}
