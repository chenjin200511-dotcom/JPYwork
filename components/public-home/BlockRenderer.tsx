"use client";

// Purpose: Renders enabled public homepage blocks from editable content JSON.
import type { Dictionary, SiteBlock } from "@/lib/i18n/dictionary";
import { CtaBlock } from "./blocks/CtaBlock";
import { FeatureMosaicBlock } from "./blocks/FeatureMosaicBlock";
import { HeroBlock } from "./blocks/HeroBlock";
import { RolesBlock } from "./blocks/RolesBlock";
import { ShowcaseBlock } from "./blocks/ShowcaseBlock";

type BlockRendererProps = {
  blocks: SiteBlock[];
  copy: Dictionary;
  onLoginClick: () => void;
};

function renderBlock(block: SiteBlock, copy: Dictionary, onLoginClick: () => void) {
  if (!block.enabled) {
    return null;
  }

  if (block.type === "hero") {
    return <HeroBlock block={block} copy={copy} onLoginClick={onLoginClick} />;
  }

  if (block.type === "feature-mosaic") {
    return <FeatureMosaicBlock block={block} />;
  }

  if (block.type === "showcase") {
    return <ShowcaseBlock block={block} />;
  }

  if (block.type === "roles") {
    return <RolesBlock block={block} />;
  }

  if (block.type === "cta") {
    return <CtaBlock block={block} onLoginClick={onLoginClick} />;
  }

  return null;
}

export function BlockRenderer({ blocks, copy, onLoginClick }: BlockRendererProps) {
  return blocks.map((block) => (
    <div className="public-home-block" data-block-id={block.id} data-block-type={block.type} key={block.id}>
      {renderBlock(block, copy, onLoginClick)}
    </div>
  ));
}
