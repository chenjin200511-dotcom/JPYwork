"use client";

// Purpose: Provides the Apple-style top navigation for the public product page.
import { useState } from "react";
import type { Dictionary, Language } from "@/lib/i18n/dictionary";

type AppleStyleNavProps = {
  activeSection: string;
  copy: Dictionary;
  language: Language;
  onLoginClick: () => void;
  onToggleLanguage: () => void;
};

type NavTarget = "top" | "workflow" | "shopee" | "miaoshou" | "workspace";

export function AppleStyleNav({
  activeSection,
  copy,
  language,
  onLoginClick,
  onToggleLanguage,
}: AppleStyleNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems: Array<{ id: NavTarget; label: string }> = [
    { id: "top", label: copy.navigation.overview },
    { id: "workflow", label: copy.navigation.workflow },
    { id: "shopee", label: copy.navigation.shopee },
    { id: "miaoshou", label: copy.navigation.pricing },
    { id: "workspace", label: copy.navigation.workspace },
  ];

  function handleNavClick(target: NavTarget) {
    setIsMenuOpen(false);

    if (target === "workspace") {
      onLoginClick();
      return;
    }

    if (target === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    document.getElementById(target)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <nav className="apple-style-nav" aria-label="Public navigation">
      <button
        className="apple-style-nav__brand"
        type="button"
        onClick={() => handleNavClick("top")}
      >
        {copy.common.teamShortName}
      </button>

      <div className="apple-style-nav__links">
        {navItems.map((item) => (
          <button
            key={item.id}
            className="apple-style-nav__link"
            type="button"
            data-active={
              activeSection === item.id ||
              (item.id === "miaoshou" && activeSection === "tiktok")
                ? "true"
                : undefined
            }
            onClick={() => handleNavClick(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="apple-style-nav__actions">
        <button
          className="apple-style-nav__language"
          type="button"
          aria-label={copy.common.language}
          onClick={onToggleLanguage}
        >
          <span className={language === "zh" ? "is-active" : ""}>CN</span>
          <span aria-hidden="true">/</span>
          <span className={language === "en" ? "is-active" : ""}>EN</span>
        </button>
        <button
          className="apple-style-nav__menu"
          type="button"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {copy.navigation.menu}
        </button>
        <button
          className="apple-style-nav__login"
          type="button"
          onClick={onLoginClick}
        >
          {copy.common.login}
        </button>
      </div>

      <div
        className={`apple-style-nav__mobile-panel${isMenuOpen ? " is-open" : ""}`}
        aria-hidden={!isMenuOpen}
      >
        {navItems.map((item) => (
          <button
            key={`mobile-${item.id}`}
            className="apple-style-nav__mobile-link"
            type="button"
            tabIndex={isMenuOpen ? 0 : -1}
            onClick={() => handleNavClick(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
