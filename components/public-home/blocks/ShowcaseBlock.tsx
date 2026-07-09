// Purpose: Renders configurable showcase blocks for platform and data-flow sections.
import type { SiteBlock } from "@/lib/i18n/dictionary";

type ShowcaseBlockProps = {
  block: SiteBlock;
};

export function ShowcaseBlock({ block }: ShowcaseBlockProps) {
  const items = block.items ?? [];

  if (block.layout === "shopee-flow") {
    return (
      <section className="shopee-hero-section" id={block.id} aria-labelledby={`${block.id}-title`}>
        <div className="shopee-hero-section__copy">
          <h2 id={`${block.id}-title`}>{block.title}</h2>
          {block.subtitle ? <p>{block.subtitle}</p> : null}
        </div>
        <div className="shopee-flow" aria-label={block.title}>
          {items.map((item, index) => (
            <div className="shopee-flow__step interactive-card" key={`${block.id}-${item.title}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.title}</strong>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (block.layout === "future-panel") {
    return (
      <section className="tiktok-ready-section" id={block.id} aria-labelledby={`${block.id}-title`}>
        <div className="tiktok-ready-section__panel">
          <h2 id={`${block.id}-title`}>{block.title}</h2>
          {block.subtitle ? <p>{block.subtitle}</p> : null}
          <div className="tiktok-ready-section__modules">
            {items.map((item) => (
              <span key={`${block.id}-${item.title}`}>{item.title}</span>
            ))}
          </div>
          <div className="tiktok-ready-section__preview" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="miaoshou-bridge-section"
      id={block.id}
      aria-labelledby={`${block.id}-title`}
    >
      <div className="miaoshou-bridge-section__copy">
        <h2 id={`${block.id}-title`}>{block.title}</h2>
        {block.subtitle ? <p>{block.subtitle}</p> : null}
      </div>
      <div className="miaoshou-orbit" aria-label={block.title}>
        <strong>{block.center}</strong>
        {items.map((item, index) => (
          <span
            className={`miaoshou-orbit__node miaoshou-orbit__node--${index + 1}`}
            key={`${block.id}-${item.title}`}
          >
            {item.title}
          </span>
        ))}
      </div>
    </section>
  );
}
