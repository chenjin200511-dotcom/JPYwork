"use client";

// Purpose: Mounts the pointer-driven background reaction layer.
import { usePointerReaction } from "@/lib/hooks/usePointerReaction";

export function InteractiveBackgroundReaction() {
  const reactionRef = usePointerReaction();

  return (
    <div
      ref={reactionRef}
      className="interactive-background-reaction"
      aria-hidden="true"
    >
      <div className="reaction-glow" />
      <div className="reaction-ripple" />
      <div className="reaction-lift" />
    </div>
  );
}
