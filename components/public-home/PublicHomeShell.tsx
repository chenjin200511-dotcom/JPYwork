"use client";

// Purpose: Composes the public homepage from reusable sections and shared i18n copy.
import { useEffect, useState } from "react";
import { AppleStyleNav } from "./AppleStyleNav";
import { BlockRenderer } from "./BlockRenderer";
import { Footer } from "./Footer";
import { InteractiveBackgroundReaction } from "./InteractiveBackgroundReaction";
import { InteractionPatternLayer } from "./InteractionPatternLayer";
import { LoadingGate } from "./LoadingGate";
import { LoginPanel } from "./LoginPanel";
import type { Language } from "@/lib/i18n/dictionary";
import { useLanguage } from "@/lib/i18n/useLanguage";

type PublicHomeShellProps = {
  initialLanguage: Language;
};

const trackedSectionIds = ["overview", "workflow", "shopee", "tiktok", "miaoshou", "roles"];

export function PublicHomeShell({ initialLanguage }: PublicHomeShellProps) {
  const { copy, language, toggleLanguage } = useLanguage(initialLanguage);
  const [activeSection, setActiveSection] = useState("top");
  const [isLoginPanelOpen, setIsLoginPanelOpen] = useState(false);

  useEffect(() => {
    const sections = trackedSectionIds
      .map((sectionId) => document.getElementById(sectionId))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id === "overview") {
          setActiveSection("top");
          return;
        }

        if (visibleEntry?.target.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-28% 0px -56% 0px",
        threshold: [0.08, 0.18, 0.32],
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <LoadingGate copy={copy.loading}>
      <main
        className="public-home-shell"
        data-active-section={activeSection}
        data-language={language}
      >
        <InteractiveBackgroundReaction />
        <InteractionPatternLayer />
        <AppleStyleNav
          activeSection={activeSection}
          copy={copy}
          language={language}
          onLoginClick={() => setIsLoginPanelOpen(true)}
          onToggleLanguage={toggleLanguage}
        />
        <BlockRenderer
          blocks={copy.blocks}
          copy={copy}
          onLoginClick={() => setIsLoginPanelOpen(true)}
        />
        <Footer copy={copy} />
        <LoginPanel
          copy={copy}
          isOpen={isLoginPanelOpen}
          language={language}
          onClose={() => setIsLoginPanelOpen(false)}
        />
      </main>
    </LoadingGate>
  );
}
