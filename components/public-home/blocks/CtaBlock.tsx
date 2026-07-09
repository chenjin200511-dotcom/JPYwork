"use client";

// Purpose: Renders configurable final call-to-action blocks.
import type { SiteBlock } from "@/lib/i18n/dictionary";

type CtaBlockProps = {
  block: SiteBlock;
  onLoginClick: () => void;
};

export function CtaBlock({ block, onLoginClick }: CtaBlockProps) {
  return (
    <section className="final-cta-section" id={block.id} aria-labelledby={`${block.id}-title`}>
      <h2 id={`${block.id}-title`}>{block.title}</h2>
      {block.primaryCta ? (
        <button className="final-cta-section__button primary-action" type="button" onClick={onLoginClick}>
          {block.primaryCta}
        </button>
      ) : null}
    </section>
  );
}
