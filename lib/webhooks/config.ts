// Purpose: Exposes safe webhook runtime status without leaking the shared write token.
type WebhookEnv = {
  [key: string]: string | undefined;
};

export const webhookEndpoints = [
  {
    label: "Orders",
    method: "POST",
    path: "/api/webhooks/orders",
    target: "orders",
  },
  {
    label: "Listings",
    method: "POST",
    path: "/api/webhooks/listings",
    target: "listings",
  },
  {
    label: "Inventory",
    method: "POST",
    path: "/api/webhooks/inventory",
    target: "inventory",
  },
] as const;

export function getWebhookRuntimeConfig(env: WebhookEnv = process.env) {
  const tokenConfigured = Boolean(env.INTEGRATION_WEBHOOK_TOKEN);

  return {
    authHeaders: ["Authorization: Bearer <token>", "x-jpy-webhook-token"],
    endpoints: webhookEndpoints,
    missingEnvKeys: tokenConfigured ? [] : ["INTEGRATION_WEBHOOK_TOKEN"],
    tokenConfigured,
  };
}
