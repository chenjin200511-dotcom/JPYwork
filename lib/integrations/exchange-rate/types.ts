// Purpose: Defines safe exchange-rate integration placeholder types.
export type ExchangeRateIntegrationStatus = {
  configured: boolean;
  missingEnvKeys: string[];
  provider: "Exchange Rate";
};
