// Purpose: Loads localized workspace content from editable JSON with zh fallback.
import workspaceEn from "@/content/workspace.en.json";
import workspaceZh from "@/content/workspace.zh.json";
import { mergeContentFallback } from "./fallback";
import type { Language, WorkspaceContent } from "./types";

const fallbackWorkspaceContent = workspaceZh as WorkspaceContent;
const localizedWorkspaceContent: Record<Language, unknown> = {
  en: workspaceEn,
  zh: workspaceZh,
};

export function getWorkspaceContent(language: Language): WorkspaceContent {
  return mergeContentFallback(
    fallbackWorkspaceContent,
    localizedWorkspaceContent[language] ?? fallbackWorkspaceContent,
  );
}
