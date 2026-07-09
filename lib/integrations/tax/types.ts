// Purpose: Defines safe finance and tax placeholder types.
export type TaxIntegrationStatus = {
  configured: boolean;
  missingEnvKeys: string[];
  provider: "Tax";
};

export type FinanceTaxPlaceholder = {
  disclaimer: string;
  exports: string[];
  reports: string[];
};
