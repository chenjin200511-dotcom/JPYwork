// Purpose: Reserves the payment client boundary without handling real payment data.
import { NotConfiguredError, checkRequiredEnv } from "../errors";
import type {
  PaymentIntegrationStatus,
  PaymentProviderPlaceholder,
} from "./types";

const envKeys = ["PAYMENT_PROVIDER_KEY"];

export function getPaymentStatus(): PaymentIntegrationStatus {
  try {
    checkRequiredEnv("Payment", envKeys);
    return {
      configured: true,
      missingEnvKeys: [],
      provider: "Payment",
    };
  } catch (error) {
    if (error instanceof NotConfiguredError) {
      return {
        configured: false,
        missingEnvKeys: error.missingEnvKeys,
        provider: "Payment",
      };
    }

    throw error;
  }
}

export function getPaymentPlaceholder(): PaymentProviderPlaceholder {
  return {
    feeRate: null,
    providerName: "Reserved payment provider",
    withdrawalStatus: "reserved",
  };
}
