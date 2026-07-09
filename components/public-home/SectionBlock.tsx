// Purpose: Renders a public homepage section with quiet interactive cards.
import type { HomeSectionCard } from "@/lib/i18n/dictionary";

type SectionBlockProps = {
  cards: HomeSectionCard[];
  description?: string;
  id: string;
  title: string;
  variant?: "grid" | "roles";
};

export function SectionBlock({
  cards,
  description,
  id,
  title,
  variant = "grid",
}: SectionBlockProps) {
  return (
    <section
      className={`section-block section-block--${variant} section-block--${id}`}
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <header className="section-block__header">
        <h2 id={`${id}-title`}>{title}</h2>
        {description ? (
          <p className="section-block__description">{description}</p>
        ) : null}
      </header>
      <div className="section-block__cards">
        {cards.map((card) => (
          <article className="section-card interactive-card" key={`${id}-${card.title}`}>
            <span className="section-card__label">{card.label}</span>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
