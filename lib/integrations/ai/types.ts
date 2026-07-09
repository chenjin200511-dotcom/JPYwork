// Purpose: Defines safe AI integration placeholder types.
export type AiIntegrationStatus = {
  configured: boolean;
  missingEnvKeys: string[];
  provider: "AI";
};
