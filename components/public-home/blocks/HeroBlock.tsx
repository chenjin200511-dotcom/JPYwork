"use client";

// Purpose: Renders the configurable Apple-style hero block.
import type { Dictionary, SiteBlock } from "@/lib/i18n/dictionary";

type HeroBlockProps = {
  block: SiteBlock;
  copy: Dictionary;
  onLoginClick: () => void;
};

export function HeroBlock({ block, copy, onLoginClick }: HeroBlockProps) {
  const dashboard = block.dashboard ?? copy.productHome.dashboard;

  function renderTitle(title: string) {
    if (title === "让团队像系统一样运转起来。") {
      return (
        <>
          <span className="hero-title-line">让团队像系统一样</span>
          <span className="hero-title-line hero-title-line--accent">运转起来。</span>
        </>
      );
    }

    if (title === "Run the team like one system.") {
      return (
        <>
          <span className="hero-title-line">Run the team</span>
          <span className="hero-title-line hero-title-line--accent">like one system.</span>
        </>
      );
    }

    return title;
  }

  function scrollToWorkflow() {
    document.getElementById("workflow")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className="hero-product-section" id={block.id} aria-labelledby="home-title">
      <div className="hero-product-section__copy">
        <h1 id="home-title">{renderTitle(block.title)}</h1>
        {block.subtitle ? <p>{block.subtitle}</p> : null}
        <div className="hero-product-section__actions">
          {block.primaryCta ? (
            <button
              className="hero-product-section__button hero-product-section__button--primary primary-action"
              type="button"
              onClick={scrollToWorkflow}
            >
              {block.primaryCta}
            </button>
          ) : null}
          {block.secondaryCta ? (
            <button
              className="hero-product-section__button hero-product-section__button--secondary corner-link"
              type="button"
              onClick={onLoginClick}
            >
              {block.secondaryCta}
            </button>
          ) : null}
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
            {dashboard.sidebar.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </aside>

          <div className="hero-dashboard__main">
            <div className="hero-dashboard__kpi-row">
              {dashboard.kpi.map((item, index) => (
                <div className="hero-dashboard__kpi" key={item}>
                  <span>{item}</span>
                  <strong>{index === 2 ? "--" : "00"}</strong>
                </div>
              ))}
            </div>

            <div className="hero-dashboard__work-area">
              <div className="hero-dashboard__chart">
                <span>{dashboard.chartLabel}</span>
                <div className="hero-dashboard__chart-lines" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>

              <div className="hero-dashboard__tasks">
                {dashboard.tasks.map((task) => (
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
