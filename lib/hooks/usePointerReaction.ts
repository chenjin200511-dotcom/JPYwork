"use client";

// Purpose: Converts pointer position into CSS variables for background reactions.
import { useEffect, useRef } from "react";

const CALM_DELAY_MS = 460;
const DESKTOP_MIN_WIDTH = 760;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function ease(current: number, target: number, amount: number) {
  return current + (target - current) * amount;
}

function getPointerAngle(deltaX: number, deltaY: number) {
  return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
}

export function usePointerReaction() {
  const reactionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = reactionRef.current;

    if (!node) {
      return;
    }

    const layer: HTMLDivElement = node;
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const state = {
      angle: 0,
      alpha: 0,
      lastTime: performance.now(),
      lastX: window.innerWidth / 2,
      lastY: window.innerHeight / 2,
      speed: 0,
      targetAlpha: 0,
      targetSpeed: 0,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    let calmTimer: number | undefined;
    let frameId: number | undefined;
    let isMuted =
      reducedMotionQuery.matches ||
      coarsePointerQuery.matches ||
      window.innerWidth < DESKTOP_MIN_WIDTH;

    function writeVariables() {
      const angleInRadians = state.angle * (Math.PI / 180);
      const driftX = Math.cos(angleInRadians) * state.speed * 18;
      const driftY = Math.sin(angleInRadians) * state.speed * 12;
      const spreadSmall = state.speed * 76;
      const spreadMedium = state.speed * 118;
      const spreadLarge = state.speed * 152;

      layer.style.setProperty("--pointer-x", `${state.x.toFixed(1)}px`);
      layer.style.setProperty("--pointer-y", `${state.y.toFixed(1)}px`);
      layer.style.setProperty("--pointer-speed", state.speed.toFixed(3));
      layer.style.setProperty("--pointer-angle", `${state.angle.toFixed(2)}deg`);
      layer.style.setProperty("--reaction-alpha", state.alpha.toFixed(3));
      layer.style.setProperty("--reaction-drift-x", `${driftX.toFixed(2)}px`);
      layer.style.setProperty("--reaction-drift-y", `${driftY.toFixed(2)}px`);
      layer.style.setProperty("--reaction-drift-x-negative", `${(-driftX).toFixed(2)}px`);
      layer.style.setProperty("--reaction-drift-y-negative", `${(-driftY).toFixed(2)}px`);
      layer.style.setProperty("--reaction-spread-small", `${spreadSmall.toFixed(2)}px`);
      layer.style.setProperty("--reaction-spread-medium", `${spreadMedium.toFixed(2)}px`);
      layer.style.setProperty("--reaction-spread-large", `${spreadLarge.toFixed(2)}px`);
      layer.style.setProperty("--reaction-glow-opacity", (state.alpha * 0.46).toFixed(3));
      layer.style.setProperty("--reaction-ripple-opacity", (state.alpha * 0.42).toFixed(3));
      layer.style.setProperty("--reaction-lift-opacity", (state.alpha * 0.5).toFixed(3));
    }

    function requestTick() {
      if (frameId === undefined) {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    function tick() {
      frameId = undefined;

      state.x = ease(state.x, state.targetX, 0.18);
      state.y = ease(state.y, state.targetY, 0.18);
      state.speed = ease(state.speed, state.targetSpeed, 0.14);
      state.alpha = ease(state.alpha, state.targetAlpha, 0.12);

      writeVariables();

      const shouldKeepAnimating =
        Math.abs(state.x - state.targetX) > 0.1 ||
        Math.abs(state.y - state.targetY) > 0.1 ||
        state.speed > 0.002 ||
        state.alpha > 0.002;

      if (shouldKeepAnimating) {
        requestTick();
      }
    }

    function updateMutedState() {
      isMuted =
        reducedMotionQuery.matches ||
        coarsePointerQuery.matches ||
        window.innerWidth < DESKTOP_MIN_WIDTH;

      layer.classList.toggle("is-reaction-muted", isMuted);

      if (isMuted) {
        state.targetAlpha = 0;
        state.targetSpeed = 0;
      }

      requestTick();
    }

    function calmReaction() {
      state.targetAlpha = 0;
      state.targetSpeed = 0;
      requestTick();
    }

    function handlePointerMove(event: PointerEvent) {
      if (isMuted || event.pointerType === "touch") {
        return;
      }

      const now = performance.now();
      const deltaX = event.clientX - state.lastX;
      const deltaY = event.clientY - state.lastY;
      const elapsed = Math.max(now - state.lastTime, 16);
      const distance = Math.hypot(deltaX, deltaY);
      const normalizedSpeed = clamp(distance / elapsed / 1.25, 0, 1);

      state.targetX = event.clientX;
      state.targetY = event.clientY;
      state.targetSpeed = normalizedSpeed;
      state.targetAlpha = 1;

      if (distance > 0.5) {
        state.angle = getPointerAngle(deltaX, deltaY);
      }

      state.lastX = event.clientX;
      state.lastY = event.clientY;
      state.lastTime = now;

      if (calmTimer !== undefined) {
        window.clearTimeout(calmTimer);
      }

      calmTimer = window.setTimeout(calmReaction, CALM_DELAY_MS);
      requestTick();
    }

    function handlePointerLeave() {
      calmReaction();
    }

    function handleResize() {
      state.targetX = clamp(state.targetX, 0, window.innerWidth);
      state.targetY = clamp(state.targetY, 0, window.innerHeight);
      updateMutedState();
    }

    writeVariables();
    updateMutedState();

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("blur", handlePointerLeave);
    window.addEventListener("resize", handleResize);
    reducedMotionQuery.addEventListener("change", updateMutedState);
    coarsePointerQuery.addEventListener("change", updateMutedState);

    return () => {
      if (frameId !== undefined) {
        window.cancelAnimationFrame(frameId);
      }

      if (calmTimer !== undefined) {
        window.clearTimeout(calmTimer);
      }

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
      window.removeEventListener("resize", handleResize);
      reducedMotionQuery.removeEventListener("change", updateMutedState);
      coarsePointerQuery.removeEventListener("change", updateMutedState);
    };
  }, []);

  return reactionRef;
}
