"use client";

// Purpose: Renders the Apple-style hero with one dominant dashboard mockup.
import type { Dictionary } from "@/lib/i18n/dictionary";

type HeroProductSectionProps = {
  copy: Dictionary;
  onLoginClick: () => void;
};

export function HeroProductSection({
  copy,
  onLoginClick,
}: HeroProductSectionProps) {
  function scrollToWorkflow() {
    document.getElementById("workflow")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className="hero-product-section" id="overview" aria-labelledby="home-title">
      <div className="hero-product-section__copy">
        <h1 id="home-title">{copy.productHome.hero.title}</h1>
        <p>{copy.productHome.hero.subtitle}</p>
        <div className="hero-product-section__actions">
          <button
            className="hero-product-section__button hero-product-section__button--primary primary-action"
            type="button"
            onClick={scrollToWorkflow}
          >
            {copy.productHome.hero.primaryAction}
          </button>
          <button
            className="hero-product-section__button hero-product-section__button--secondary corner-link"
            type="button"
            onClick={onLoginClick}
          >
            {copy.productHome.hero.secondaryAction}
          </button>
        </div>
      </div>

      <div className="hero-dashboard" aria-label={copy.common.teamWorkspace}>
        <div className="hero-dashboard__window-bar" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="hero-dashboard__body">
          <aside className="hero-dashboard__sidebar">
            <strong>{copy.common.teamShortName}</strong>
            {copy.productHome.dashboard.sidebar.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </aside>

          <div className="hero-dashboard__main">
            <div className="hero-dashboard__kpi-row">
              {copy.productHome.dashboard.kpi.map((item, index) => (
                <div className="hero-dashboard__kpi" key={item}>
                  <span>{item}</span>
                  <strong>{index === 2 ? "--" : "00"}</strong>
                </div>
              ))}
            </div>

            <div className="hero-dashboard__work-area">
              <div className="hero-dashboard__chart">
                <span>{copy.productHome.dashboard.chartLabel}</span>
                <div className="hero-dashboard__chart-lines" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>

              <div className="hero-dashboard__tasks">
                {copy.productHome.dashboard.tasks.map((task) => (
                  <div className="hero-dashboard__task" key={task}>
                    <span>{task}</span>
                    <strong>{copy.workspace.reservedLabel}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
