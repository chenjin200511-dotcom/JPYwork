// Purpose: Aggregates reserved integration configuration status without returning secrets.
import { getAiStatus } from "./ai/client";
import { getExchangeRateStatus } from "./exchange-rate/client";
import { getLogisticsStatus } from "./logistics/client";
import { getMiaoshouStatus } from "./miaoshou/client";
import { getPaymentStatus } from "./payment/client";
import { getShopeeStatus } from "./shopee/client";
import { getTaxStatus } from "./tax/client";
import { getTiktokStatus } from "./tiktok/client";

export function getIntegrationStatuses() {
  return [
    getShopeeStatus(),
    getTiktokStatus(),
    getMiaoshouStatus(),
    getAiStatus(),
    getExchangeRateStatus(),
    getPaymentStatus(),
    getLogisticsStatus(),
    getTaxStatus(),
  ];
}
