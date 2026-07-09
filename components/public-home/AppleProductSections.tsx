// Purpose: Provides distinct Apple-style public homepage sections after the hero.
import type { Dictionary, ProductHomeCard } from "@/lib/i18n/dictionary";

type ProductSectionsProps = {
  copy: Dictionary;
  onLoginClick: () => void;
};

type MosaicCardProps = {
  card: ProductHomeCard;
  className: string;
  variant: "dashboard" | "message" | "pricing" | "bridge" | "compact";
};

function MosaicCard({ card, className, variant }: MosaicCardProps) {
  return (
    <article className={`feature-mosaic__card ${className} interactive-card`}>
      <div className="feature-mosaic__card-copy">
        {card.metric ? <strong>{card.metric}</strong> : null}
        <h3>{card.title}</h3>
        <p>{card.description}</p>
      </div>

      {variant === "dashboard" ? (
        <div className="feature-mosaic__mini-dashboard" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      ) : null}

      {variant === "message" ? (
        <div className="feature-mosaic__message-stack" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      ) : null}

      {variant === "pricing" ? (
        <div className="feature-mosaic__pricing-bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      ) : null}

      {variant === "bridge" ? (
        <div className="feature-mosaic__bridge-lines" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      ) : null}

      {card.items ? (
        <div className="feature-mosaic__tags">
          {card.items.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function FeatureMosaicSection({ copy }: { copy: Dictionary }) {
  const cards = copy.productHome.featureMosaic.cards;

  return (
    <section
      className="feature-mosaic-section"
      id="workflow"
      aria-labelledby="workflow-title"
    >
      <h2 id="workflow-title">{copy.productHome.featureMosaic.title}</h2>
      <div className="feature-mosaic">
        <MosaicCard
          card={cards.shopeeControl}
          className="feature-mosaic__card--shopee"
          variant="dashboard"
        />
        <MosaicCard
          card={cards.messages}
          className="feature-mosaic__card--messages"
          variant="message"
        />
        <MosaicCard
          card={cards.pricing}
          className="feature-mosaic__card--pricing"
          variant="pricing"
        />
        <MosaicCard
          card={cards.miaoshouBridge}
          className="feature-mosaic__card--bridge"
          variant="bridge"
        />
        <MosaicCard
          card={cards.inventory}
          className="feature-mosaic__card--small"
          variant="compact"
        />
        <MosaicCard
          card={cards.orders}
          className="feature-mosaic__card--small"
          variant="compact"
        />
        <MosaicCard
          card={cards.finance}
          className="feature-mosaic__card--small"
          variant="compact"
        />
      </div>
    </section>
  );
}

export function ShopeeHeroSection({ copy }: { copy: Dictionary }) {
  return (
    <section className="shopee-hero-section" id="shopee" aria-labelledby="shopee-title">
      <div className="shopee-hero-section__copy">
        <h2 id="shopee-title">{copy.productHome.shopeeHero.title}</h2>
        <p>{copy.productHome.shopeeHero.subtitle}</p>
      </div>
      <div className="shopee-flow" aria-label={copy.productHome.shopeeHero.title}>
        {copy.productHome.shopeeHero.steps.map((step, index) => (
          <div className="shopee-flow__step interactive-card" key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TikTokReadySection({ copy }: { copy: Dictionary }) {
  return (
    <section className="tiktok-ready-section" id="tiktok" aria-labelledby="tiktok-title">
      <div className="tiktok-ready-section__panel">
        <h2 id="tiktok-title">{copy.productHome.tiktokReady.title}</h2>
        <p>{copy.productHome.tiktokReady.subtitle}</p>
        <div className="tiktok-ready-section__modules">
          {copy.productHome.tiktokReady.modules.map((moduleName) => (
            <span key={moduleName}>{moduleName}</span>
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

export function MiaoshouBridgeSection({ copy }: { copy: Dictionary }) {
  return (
    <section
      className="miaoshou-bridge-section"
      id="miaoshou"
      aria-labelledby="miaoshou-title"
    >
      <div className="miaoshou-bridge-section__copy">
        <h2 id="miaoshou-title">{copy.productHome.miaoshouBridge.title}</h2>
        <p>{copy.productHome.miaoshouBridge.subtitle}</p>
      </div>
      <div className="miaoshou-orbit" aria-label={copy.productHome.miaoshouBridge.title}>
        <strong>{copy.productHome.miaoshouBridge.center}</strong>
        {copy.productHome.miaoshouBridge.flows.map((flow, index) => (
          <span
            className={`miaoshou-orbit__node miaoshou-orbit__node--${index + 1}`}
            key={flow}
          >
            {flow}
          </span>
        ))}
      </div>
    </section>
  );
}

export function RolesSection({ copy }: { copy: Dictionary }) {
  const roles = copy.productHome.roles;

  return (
    <section className="roles-section" id="roles" aria-labelledby="roles-title">
      <h2 id="roles-title">{roles.title}</h2>
      <div className="roles-layout">
        <RoleCard card={roles.owner} className="roles-layout__card--owner" />
        <RoleCard card={roles.operator} className="roles-layout__card--operator" />
        <RoleCard card={roles.support} className="roles-layout__card--support" />
      </div>
    </section>
  );
}

function RoleCard({ card, className }: { card: ProductHomeCard; className: string }) {
  return (
    <article className={`roles-layout__card ${className} interactive-card`}>
      <strong>{card.metric}</strong>
      <h3>{card.title}</h3>
      <p>{card.description}</p>
      {card.items ? (
        <div className="roles-layout__tags">
          {card.items.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function FinalCTASection({ copy, onLoginClick }: ProductSectionsProps) {
  return (
    <section className="final-cta-section" aria-labelledby="final-cta-title">
      <h2 id="final-cta-title">{copy.productHome.finalCta.title}</h2>
      <button className="final-cta-section__button primary-action" type="button" onClick={onLoginClick}>
        {copy.productHome.finalCta.action}
      </button>
    </section>
  );
}
