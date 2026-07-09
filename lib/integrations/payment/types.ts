// Purpose: Defines safe payment provider placeholder types.
export type PaymentIntegrationStatus = {
  configured: boolean;
  missingEnvKeys: string[];
  provider: "Payment";
};

export type PaymentProviderPlaceholder = {
  feeRate: number | null;
  providerName: string;
  withdrawalStatus: "reserved";
};
