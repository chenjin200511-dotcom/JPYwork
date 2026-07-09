// Purpose: Defines safe integration placeholder errors that never expose secrets.
export class NotConfiguredError extends Error {
  constructor(
    public readonly provider: string,
    public readonly missingEnvKeys: string[],
  ) {
    super(`${provider} is not configured.`);
    this.name = "NotConfiguredError";
  }
}

export function checkRequiredEnv(provider: string, envKeys: string[]) {
  const missingEnvKeys = envKeys.filter((key) => !process.env[key]);

  if (missingEnvKeys.length > 0) {
    throw new NotConfiguredError(provider, missingEnvKeys);
  }

  return {
    configured: true as const,
    provider,
  };
}
