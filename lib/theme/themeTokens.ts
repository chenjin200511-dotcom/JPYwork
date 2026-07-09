// Purpose: Exposes editable design tokens from content/theme.json.
import themeTokens from "@/content/theme.json";

export type ThemeTokens = typeof themeTokens;

export function getThemeTokens(): ThemeTokens {
  return themeTokens;
}
