// Purpose: Defines safe Shopee integration placeholder types.
export type ShopeeIntegrationStatus = {
  configured: boolean;
  missingEnvKeys: string[];
  provider: "Shopee";
};
