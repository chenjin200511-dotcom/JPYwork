"use client";

// Purpose: Shows an owner-only placeholder for future JSON content management.
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Language } from "@/lib/i18n/dictionary";
import { useLanguage } from "@/lib/i18n/useLanguage";

type ContentSettingsPlaceholderProps = {
  initialLanguage: Language;
};

type CurrentUserResponse =
  | {
      success: true;
      data: {
        user: {
          role: "OWNER" | "OPERATOR" | "SUPPORT";
        } | null;
      };
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

export function ContentSettingsPlaceholder({
  initialLanguage,
}: ContentSettingsPlaceholderProps) {
  const { copy, language, toggleLanguage } = useLanguage(initialLanguage);
  const [isOwner, setIsOwner] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        const result = (await response.json()) as CurrentUserResponse;
        setIsOwner(
          response.ok && result.success && result.data.user?.role === "OWNER",
        );
      } finally {
        setIsChecking(false);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="workspace-placeholder workspace-placeholder--locked">
      <section className="workspace-placeholder__locked-card interactive-card">
        <p className="workspace-placeholder__eyebrow">
          {copy.workspace.contentSettings}
        </p>
        <h1>
          {isChecking
            ? copy.workspace.loadingLabel
            : isOwner
              ? copy.workspace.contentSettingsTitle
              : copy.workspace.authRequiredTitle}
        </h1>
        <p className="workspace-placeholder__subtitle">
          {isOwner
            ? copy.workspace.contentSettingsSubtitle
            : copy.workspace.authRequiredSubtitle}
        </p>
        <div className="workspace-placeholder__toolbar-actions workspace-placeholder__toolbar-actions--center">
          <button
            className="workspace-placeholder__toolbar-link workspace-placeholder__toolbar-language"
            type="button"
            aria-label={copy.common.language}
            onClick={toggleLanguage}
          >
            <span className={language === "zh" ? "is-active" : ""}>CN</span>
            <span aria-hidden="true">/</span>
            <span className={language === "en" ? "is-active" : ""}>EN</span>
          </button>
          <Link href="/workspace" className="workspace-placeholder__link primary-action">
            {copy.workspace.homeLink}
          </Link>
        </div>
      </section>
    </main>
  );
}
