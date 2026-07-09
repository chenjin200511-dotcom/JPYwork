// Purpose: Provides framework-free loading state helpers for tests and timing.
export const loadingDurations = {
  booting: 180,
  counting: 2400,
  pauseAtComplete: 200,
  wiping: 520,
  reducedCounting: 420,
};

export function clampLoadingNumber(value) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function formatLoadingNumber(value) {
  return String(clampLoadingNumber(value)).padStart(3, "0");
}

export function getLoadingProgress(elapsedMs, prefersReducedMotion) {
  const countDuration = prefersReducedMotion
    ? loadingDurations.reducedCounting
    : loadingDurations.counting;
  const progress = (elapsedMs / countDuration) * 100;

  return clampLoadingNumber(progress);
}

export function getLoadingPhase(elapsedMs, prefersReducedMotion) {
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
