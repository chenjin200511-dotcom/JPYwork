// Purpose: Loads localized public site content from editable JSON with zh fallback.
import siteEn from "@/content/site.en.json";
import siteZh from "@/content/site.zh.json";
import { mergeContentFallback } from "./fallback";
import type { Language, SiteContent } from "./types";

const fallbackSiteContent = siteZh as SiteContent;
const localizedSiteContent: Record<Language, unknown> = {
  en: siteEn,
  zh: siteZh,
};

export function getSiteContent(language: Language): SiteContent {
  return mergeContentFallback(
    fallbackSiteContent,
    localizedSiteContent[language] ?? fallbackSiteContent,
  );
}
