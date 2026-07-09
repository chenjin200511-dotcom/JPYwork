"use client";

// Purpose: Provides the localStorage-backed language switch control.
import type { Dictionary, Language } from "@/lib/i18n/dictionary";

type LanguageToggleProps = {
  copy: Dictionary;
  language: Language;
  onToggleLanguage: () => void;
};

export function LanguageToggle({
  copy,
  language,
  onToggleLanguage,
}: LanguageToggleProps) {
  return (
    <button
      type="button"
      className="language-toggle corner-link"
      onClick={onToggleLanguage}
      aria-label={copy.common.language}
    >
      <span className={language === "zh" ? "is-active" : ""}>中</span>
      <span aria-hidden="true">/</span>
      <span className={language === "en" ? "is-active" : ""}>EN</span>
    </button>
  );
}
