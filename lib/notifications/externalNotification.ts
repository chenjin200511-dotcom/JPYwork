// Purpose: Prepares lightweight Markdown notifications for mobile collaboration channels.
export type ExternalNotificationInput = {
  entityId?: string;
  entityType: "CustomerMessage" | "Order" | "PricingRule";
  lines: string[];
  title: string;
};

export type ExternalNotificationResult =
  | { markdown: string; sent: true; skipped: false }
  | { markdown: string; reason: "NOT_CONFIGURED"; sent: false; skipped: true }
  | { markdown: string; reason: "REQUEST_FAILED"; sent: false; skipped: true };

export function buildExternalNotificationMarkdown(input: ExternalNotificationInput) {
  const body = input.lines
    .filter((line) => line.trim().length > 0)
    .map((line) => `- ${line}`)
    .join("\n");
  const entity = input.entityId ? `\n\n> ${input.entityType}: ${input.entityId}` : "";

  return `### ${input.title}\n\n${body}${entity}`;
}

export async function sendExternalNotification(
  input: ExternalNotificationInput,
): Promise<ExternalNotificationResult> {
  const markdown = buildExternalNotificationMarkdown(input);
  const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;

  if (!webhookUrl) {
    return { markdown, reason: "NOT_CONFIGURED", sent: false, skipped: true };
  }

  try {
    const response = await fetch(webhookUrl, {
      body: JSON.stringify({ text: markdown }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      return { markdown, reason: "REQUEST_FAILED", sent: false, skipped: true };
    }

    return { markdown, sent: true, skipped: false };
  } catch {
    return { markdown, reason: "REQUEST_FAILED", sent: false, skipped: true };
  }
}

export function isOrderRiskSignal(input: {
  riskLevel?: string | null;
  status?: string | null;
}) {
  return input.status === "RISK" || input.riskLevel === "HIGH" || input.riskLevel === "CRITICAL";
}
