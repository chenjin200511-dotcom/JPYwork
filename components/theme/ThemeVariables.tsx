// Purpose: Injects key editable theme.json values as CSS variables.
import { getThemeTokens } from "@/lib/theme/themeTokens";

export function ThemeVariables() {
  const theme = getThemeTokens();
  const css = `
    :root {
      --jpy-theme-radius-card: ${theme.radius.card};
      --jpy-theme-radius-button: ${theme.radius.button};
      --jpy-theme-radius-workspace-card: ${theme.radius.workspaceCard};
      --jpy-theme-section-desktop: ${theme.spacing.sectionDesktop};
      --jpy-theme-section-mobile: ${theme.spacing.sectionMobile};
      --jpy-theme-grid-gap: ${theme.spacing.gridGap};
      --jpy-theme-display-desktop: ${theme.typography.displayDesktop};
      --jpy-theme-display-mobile: ${theme.typography.displayMobile};
      --jpy-theme-section-title-desktop: ${theme.typography.sectionTitleDesktop};
      --jpy-theme-section-title-mobile: ${theme.typography.sectionTitleMobile};
      --jpy-theme-subtitle-desktop: ${theme.typography.subtitleDesktop};
      --jpy-theme-body: ${theme.typography.body};
      --jpy-theme-card-large-height: ${theme.cards.largeHeight};
      --jpy-theme-card-medium-height: ${theme.cards.mediumHeight};
      --jpy-theme-card-small-height: ${theme.cards.smallHeight};
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
