// Purpose: Renders configurable asymmetric feature cards.
import type { SiteBlock, SiteBlockItem } from "@/lib/i18n/dictionary";

type FeatureMosaicBlockProps = {
  block: SiteBlock;
};

function getCardClass(item: SiteBlockItem, index: number) {
  if (item.visual === "listing") {
    return "feature-mosaic__card--shopee";
  }

  if (item.visual === "messages") {
    return "feature-mosaic__card--messages";
  }

  if (item.visual === "pricing") {
    return "feature-mosaic__card--pricing";
  }

  if (item.visual === "bridge") {
    return "feature-mosaic__card--bridge";
  }

  if (item.size === "large") {
    return index % 2 === 0 ? "feature-mosaic__card--shopee" : "feature-mosaic__card--bridge";
  }

  if (item.size === "medium") {
    return index % 2 === 0 ? "feature-mosaic__card--messages" : "feature-mosaic__card--pricing";
  }

  return "feature-mosaic__card--small";
}

function getVariant(item: SiteBlockItem) {
  if (item.visual === "listing") {
    return "dashboard";
  }

  if (item.visual === "messages") {
    return "message";
  }

  if (item.visual === "pricing") {
    return "pricing";
  }

  if (item.visual === "bridge") {
    return "bridge";
  }

  return "compact";
}

function MosaicVisual({ variant }: { variant: string }) {
  if (variant === "dashboard") {
    return (
      <div className="feature-mosaic__mini-dashboard" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (variant === "message") {
    return (
      <div className="feature-mosaic__message-stack" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (variant === "pricing") {
    return (
      <div className="feature-mosaic__pricing-bars" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (variant === "bridge") {
    return (
      <div className="feature-mosaic__bridge-lines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    );
  }

  return null;
}

export function FeatureMosaicBlock({ block }: FeatureMosaicBlockProps) {
  const items = block.items ?? [];

  return (
    <section
      className="feature-mosaic-section"
      id={block.id}
      aria-labelledby={`${block.id}-title`}
    >
      <h2 id={`${block.id}-title`}>{block.title}</h2>
      <div className="feature-mosaic">
        {items.map((item, index) => {
          const variant = getVariant(item);

          return (
            <article
              className={`feature-mosaic__card ${getCardClass(item, index)} interactive-card`}
              key={`${block.id}-${item.title}`}
            >
              <div className="feature-mosaic__card-copy">
                {item.metric ? <strong>{item.metric}</strong> : null}
                <h3>{item.title}</h3>
                {item.description ? <p>{item.description}</p> : null}
              </div>
              <MosaicVisual variant={variant} />
              {item.items ? (
                <div className="feature-mosaic__tags">
                  {item.items.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
