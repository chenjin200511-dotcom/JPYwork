// Purpose: Reports notification-hook configuration without exposing the webhook URL.
type NotificationEnv = {
  [key: string]: string | undefined;
};

export function getNotificationRuntimeConfig(env: NotificationEnv = process.env) {
  const configured = Boolean(env.NOTIFICATION_WEBHOOK_URL);

  return {
    configured,
    editableInUi: false,
    missingEnvKeys: configured ? [] : ["NOTIFICATION_WEBHOOK_URL"],
    source: "environment",
  };
}
