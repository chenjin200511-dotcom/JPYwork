// Purpose: Renders configurable role cards with asymmetric hierarchy.
import type { SiteBlock, SiteBlockItem } from "@/lib/i18n/dictionary";

type RolesBlockProps = {
  block: SiteBlock;
};

function getRoleClass(item: SiteBlockItem, index: number) {
  if (item.visual === "owner" || item.size === "large") {
    return "roles-layout__card--owner";
  }

  return index % 2 === 0 ? "roles-layout__card--operator" : "roles-layout__card--support";
}

export function RolesBlock({ block }: RolesBlockProps) {
  const items = block.items ?? [];

  return (
    <section className="roles-section" id={block.id} aria-labelledby={`${block.id}-title`}>
      <h2 id={`${block.id}-title`}>{block.title}</h2>
      <div className="roles-layout">
        {items.map((item, index) => (
          <article
            className={`roles-layout__card ${getRoleClass(item, index)} interactive-card`}
            key={`${block.id}-${item.title}`}
          >
            <strong>{item.metric}</strong>
            <h3>{item.title}</h3>
            {item.description ? <p>{item.description}</p> : null}
            {item.items ? (
              <div className="roles-layout__tags">
                {item.items.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
