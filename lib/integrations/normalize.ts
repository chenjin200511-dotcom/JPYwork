// Purpose: Normalizes official API, Miaoshou, CSV-like, or browser extension JSON into JPY records.
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  webhookInventorySchema,
  webhookListingSchema,
  webhookOrderSchema,
} from "@/lib/api/schemas";

export type NormalizedWebhookOrder = ReturnType<typeof normalizeWebhookOrder>;
export type NormalizedWebhookListing = ReturnType<typeof normalizeWebhookListing>;
export type NormalizedWebhookInventory = ReturnType<typeof normalizeWebhookInventory>;

export function computeInventoryStatus(available: number, safetyStock: number) {
  if (available <= 0) {
    return "OUT_OF_STOCK" as const;
  }

  if (available < safetyStock) {
    return "LOW_STOCK" as const;
  }

  return "NORMAL" as const;
}

export function normalizeWebhookOrder(input: z.infer<typeof webhookOrderSchema>) {
  const { idempotencyKey, source, riskFlags, ...order } = input;

  return {
    data: {
      ...order,
      riskFlags: riskFlags as Prisma.InputJsonValue,
    },
    idempotencyKey,
    source,
  };
}

export function normalizeWebhookListing(input: z.infer<typeof webhookListingSchema>) {
  const { idempotencyKey, source, ...listing } = input;

  return {
    data: listing,
    idempotencyKey,
    source,
  };
}

export function normalizeWebhookInventory(input: z.infer<typeof webhookInventorySchema>) {
  const { idempotencyKey, source, status, ...inventory } = input;

  return {
    data: {
      ...inventory,
      status: status ?? computeInventoryStatus(inventory.available, inventory.safetyStock),
    },
    idempotencyKey,
    source,
  };
}
