"use client";

// Purpose: Shows the localized JPY public homepage hero copy and primary actions.
import type { Dictionary } from "@/lib/i18n/dictionary";

type HeroIntroProps = {
  copy: Dictionary;
  onLoginClick: () => void;
};

export function HeroIntro({ copy, onLoginClick }: HeroIntroProps) {
  function scrollToWorkflow() {
    document.getElementById("workflow")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className="hero-intro" aria-labelledby="home-title">
      <h1 id="home-title">{copy.hero.title}</h1>
      <p className="hero-intro__subtitle">{copy.hero.subtitle}</p>
      <div className="hero-intro__actions">
        <button
          className="hero-intro__action hero-intro__action--primary primary-action"
          type="button"
          onClick={scrollToWorkflow}
        >
          {copy.hero.primaryAction}
        </button>
        <button
          className="hero-intro__action hero-intro__action--secondary corner-link"
          type="button"
          onClick={onLoginClick}
        >
          {copy.hero.secondaryAction}
        </button>
      </div>
    </section>
  );
}
