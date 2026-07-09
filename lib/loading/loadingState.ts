// Purpose: Provides typed loading state helpers for the public-home LoadingGate.
export type LoadingPhase = "booting" | "counting" | "wiping" | "ready";

export const loadingDurations = {
  booting: 180,
  counting: 2400,
  pauseAtComplete: 200,
  wiping: 520,
  reducedCounting: 420,
};

export function clampLoadingNumber(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function formatLoadingNumber(value: number): string {
  return String(clampLoadingNumber(value)).padStart(3, "0");
}

export function getLoadingProgress(
  elapsedMs: number,
  prefersReducedMotion: boolean,
): number {
  const countDuration = prefersReducedMotion
    ? loadingDurations.reducedCounting
    : loadingDurations.counting;
  const progress = (elapsedMs / countDuration) * 100;

  return clampLoadingNumber(progress);
}

export function getLoadingPhase(
  elapsedMs: number,
  prefersReducedMotion: boolean,
): LoadingPhase {
  if (prefersReducedMotion) {
    if (elapsedMs >= loadingDurations.reducedCounting + 80) {
      return "ready";
    }

    if (elapsedMs >= loadingDurations.booting / 2) {
      return "counting";
    }

    return "booting";
  }

  if (
    elapsedMs >=
    loadingDurations.counting +
      loadingDurations.pauseAtComplete +
      loadingDurations.wiping
  ) {
    return "ready";
  }

  if (elapsedMs >= loadingDurations.counting + loadingDurations.pauseAtComplete) {
    return "wiping";
  }

  if (elapsedMs >= loadingDurations.booting) {
    return "counting";
  }

  return "booting";
}
