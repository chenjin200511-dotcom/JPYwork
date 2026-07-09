// Purpose: Merges editable JSON content with a fallback so missing fields do not break pages.
export function mergeContentFallback<T>(fallback: T, content: unknown): T {
  if (Array.isArray(fallback)) {
    return (Array.isArray(content) ? content : fallback) as T;
  }

  if (!fallback || typeof fallback !== "object") {
    return (content ?? fallback) as T;
  }

  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return fallback;
  }

  const merged: Record<string, unknown> = { ...(fallback as Record<string, unknown>) };
  const source = content as Record<string, unknown>;

  for (const key of Object.keys(merged)) {
    merged[key] = mergeContentFallback(merged[key], source[key]);
  }

  for (const key of Object.keys(source)) {
    if (!(key in merged)) {
      merged[key] = source[key];
    }
  }

  return merged as T;
}
