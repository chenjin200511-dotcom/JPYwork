"use client";

// Purpose: Backward-compatible wrapper that now renders the Apple-style top nav.
import type { Dictionary, Language } from "@/lib/i18n/dictionary";
import { AppleStyleNav } from "./AppleStyleNav";

type CornerNavigationProps = {
  activeSection?: string;
  copy: Dictionary;
  language: Language;
  onLoginClick: () => void;
  onToggleLanguage: () => void;
};

export function CornerNavigation({
  activeSection = "top",
  copy,
  language,
  onLoginClick,
  onToggleLanguage,
}: CornerNavigationProps) {
  return (
    <AppleStyleNav
      activeSection={activeSection}
      copy={copy}
      language={language}
      onLoginClick={onLoginClick}
      onToggleLanguage={onToggleLanguage}
    />
  );
}
