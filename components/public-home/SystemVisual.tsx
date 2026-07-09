"use client";

// Purpose: Renders the CSS-built JPY workspace node network for the public hero.
import type { CSSProperties, PointerEvent } from "react";
import { useEffect, useRef } from "react";
import type { Dictionary, SystemVisualNodeKey } from "@/lib/i18n/dictionary";

type SystemVisualProps = {
  copy: Dictionary;
};

type VisualStyle = CSSProperties & {
  "--node-delay"?: string;
  "--node-index"?: number;
};

const systemNodeKeys: SystemVisualNodeKey[] = [
  "shopee",
  "tasks",
  "messages",
  "orders",
  "inventory",
  "pricing",
  "finance",
  "miaoshou",
  "tiktok",
];

export function SystemVisual({ copy }: SystemVisualProps) {
  const visualRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const targetShiftRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  function scheduleShiftWrite() {
    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      visualRef.current?.style.setProperty(
        "--visual-shift-x",
        `${targetShiftRef.current.x.toFixed(2)}px`,
      );
      visualRef.current?.style.setProperty(
        "--visual-shift-y",
        `${targetShiftRef.current.y.toFixed(2)}px`,
      );
    });
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (
      event.pointerType === "touch" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;

    targetShiftRef.current = {
      x: Math.max(-8, Math.min(8, normalizedX * 16)),
      y: Math.max(-8, Math.min(8, normalizedY * 16)),
    };
    scheduleShiftWrite();
  }

  function handlePointerLeave() {
    targetShiftRef.current = { x: 0, y: 0 };
    scheduleShiftWrite();
  }

  return (
    <div
      ref={visualRef}
      className="system-visual interactive-card"
      aria-label={copy.common.teamWorkspace}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      <div className="system-visual__field" aria-hidden="true" />
      <div className="system-visual__device" aria-hidden="true">
        <div className="system-visual__device-bar">
          <span />
          <span />
          <span />
        </div>
        <div className="system-visual__device-body">
          <div className="system-visual__device-rail">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="system-visual__device-main">
            <span className="system-visual__device-line system-visual__device-line--wide" />
            <span className="system-visual__device-line" />
            <div className="system-visual__device-grid">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
      <div className="system-visual__network">
        {systemNodeKeys.map((nodeKey, index) => (
          <span
            className={`system-visual__line system-visual__line--${nodeKey}`}
            style={
              {
                "--node-delay": `${260 + index * 48}ms`,
                "--node-index": index,
              } as VisualStyle
            }
            key={`line-${nodeKey}`}
            aria-hidden="true"
          />
        ))}
        <div className="system-visual__center system-node">
          {copy.systemVisual.centerNode}
        </div>
        {systemNodeKeys.map((nodeKey, index) => (
          <div
            className={`system-visual__node system-node system-node--${nodeKey}`}
            style={
              {
                "--node-delay": `${340 + (index + 1) * 58}ms`,
                "--node-index": index + 1,
              } as VisualStyle
            }
            key={nodeKey}
          >
            {copy.systemVisual.nodes[nodeKey]}
          </div>
        ))}
      </div>
    </div>
  );
}
