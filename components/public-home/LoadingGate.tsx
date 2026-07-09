"use client";

// Purpose: Runs the public-home boot, count, wipe, and ready loading sequence.
import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary";
import {
  formatLoadingNumber,
  getLoadingPhase,
  getLoadingProgress,
  type LoadingPhase,
} from "@/lib/loading/loadingState";

type LoadingGateProps = {
  copy: Dictionary["loading"];
  children: React.ReactNode;
};

function prefersReducedMotion() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function LoadingGate({ copy, children }: LoadingGateProps) {
  const [phase, setPhase] = useState<LoadingPhase>("booting");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduceMotion = prefersReducedMotion();
    const startTime = performance.now();
    let frameId = 0;

    function tick(now: number) {
      const elapsedMs = now - startTime;
      const nextPhase = getLoadingPhase(elapsedMs, reduceMotion);
      const nextProgress = getLoadingProgress(elapsedMs, reduceMotion);

      setPhase(nextPhase);
      setProgress(nextProgress);

      if (nextPhase !== "ready") {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const isReady = phase === "ready";
  const loadingNumber = formatLoadingNumber(progress);

  return (
    <>
      <div
        className={`loading-gate loading-gate--${phase}`}
        aria-hidden={isReady}
        data-phase={phase}
      >
        <div className="loading-gate__corner loading-gate__corner--top-left">
          {copy.teamSystem}
        </div>
        <div className="loading-gate__corner loading-gate__corner--top-right">
          {copy.shopeeFirst}
        </div>
        <div className="loading-gate__corner loading-gate__corner--bottom-left">
          {copy.miaoshouBridge}
        </div>
        <div className="loading-gate__corner loading-gate__corner--bottom-right">
          {copy.remoteOps}
        </div>
        <div className="loading-gate__center" role={isReady ? undefined : "status"}>
          <p>{copy.initializing}</p>
          <strong>{loadingNumber}</strong>
        </div>
        <div className="loading-gate__wipe" aria-hidden="true" />
        <div className="loading-gate__progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
      </div>
      <div className={isReady ? "loading-content is-ready" : "loading-content"}>
        {children}
      </div>
    </>
  );
}
