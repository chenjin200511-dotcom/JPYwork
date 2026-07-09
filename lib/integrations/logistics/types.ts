// Purpose: Defines safe logistics integration placeholder types.
export type LogisticsIntegrationStatus = {
  configured: boolean;
  missingEnvKeys: string[];
  provider: "Logistics";
};
