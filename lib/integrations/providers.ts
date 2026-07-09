// Purpose: Declares reserved external integration placeholders without real API calls.
import type { ConnectionProvider } from "@prisma/client";

export type IntegrationPlaceholder = {
  envKeys: string[];
  label: string;
  provider: ConnectionProvider;
  status: "reserved";
};

export const integrationPlaceholders: IntegrationPlaceholder[] = [
  {
    envKeys: ["SHOPEE_CLIENT_ID", "SHOPEE_CLIENT_SECRET"],
    label: "Shopee",
    provider: "SHOPEE",
    status: "reserved",
  },
  {
    envKeys: ["TIKTOK_APP_KEY", "TIKTOK_APP_SECRET"],
    label: "TikTok Shop",
    provider: "TIKTOK",
    status: "reserved",
  },
  {
    envKeys: ["MIAOSHOU_API_KEY"],
    label: "Miaoshou ERP",
    provider: "MIAOSHOU",
    status: "reserved",
  },
  {
    envKeys: ["OPENAI_API_KEY"],
    label: "AI Assistant",
    provider: "AI",
    status: "reserved",
  },
  {
    envKeys: ["EXCHANGE_RATE_API_KEY"],
    label: "Exchange Rate",
    provider: "EXCHANGE_RATE",
    status: "reserved",
  },
  {
    envKeys: ["PAYMENT_PROVIDER_KEY"],
    label: "Payment",
    provider: "PAYMENT",
    status: "reserved",
  },
  {
    envKeys: ["LOGISTICS_API_KEY"],
    label: "Logistics",
    provider: "LOGISTICS",
    status: "reserved",
  },
  {
    envKeys: ["TAX_EXPORT_KEY"],
    label: "Tax Export",
    provider: "TAX",
    status: "reserved",
  },
];
