// Purpose: Reads editable content from the database first, then falls back to local JSON files.
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSiteContent } from "./getSiteContent";
import { getWorkspaceContent } from "./getWorkspaceContent";
import type { Language } from "./types";
import themeTokens from "@/content/theme.json";

export type ContentKey = "site" | "workspace" | "theme";
export type ContentLanguage = Language | "neutral";

function fallbackContent(key: ContentKey, language: ContentLanguage) {
  if (key === "workspace") {
    return getWorkspaceContent(language === "en" ? "en" : "zh");
  }

  if (key === "theme") {
    return themeTokens;
  }

  return getSiteContent(language === "en" ? "en" : "zh");
}

export async function getLatestContentVersion(
  key: ContentKey,
  language: ContentLanguage,
) {
  try {
    const latest = await prisma.contentVersion.findFirst({
      orderBy: {
        version: "desc",
      },
      where: {
        key,
        language,
      },
    });

    if (latest) {
      return {
        content: latest.contentJson,
        source: "database" as const,
        version: latest.version,
      };
    }
  } catch (error) {
    console.error("Content database fallback:", error);
  }

  return {
    content: fallbackContent(key, language),
    source: "file" as const,
    version: 0,
  };
}

export async function saveContentVersion(input: {
  contentJson: Record<string, unknown>;
  createdBy: string;
  key: ContentKey;
  language: ContentLanguage;
}) {
  const latest = await prisma.contentVersion.findFirst({
    orderBy: {
      version: "desc",
    },
    where: {
      key: input.key,
      language: input.language,
    },
  });
  const contentJson = JSON.parse(
    JSON.stringify(input.contentJson),
  ) as Prisma.InputJsonValue;

  return prisma.contentVersion.create({
    data: {
      contentJson,
      createdBy: input.createdBy,
      key: input.key,
      language: input.language,
      version: (latest?.version ?? 0) + 1,
    },
  });
}
