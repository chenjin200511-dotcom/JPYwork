"use client";

// Purpose: Tracks the current pointer position for lightweight UI reactions.
import { useEffect, useState } from "react";

export type MousePosition = {
  x: number;
  y: number;
};

export function useMousePosition(): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      setPosition({ x: event.clientX, y: event.clientY });
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return position;
}
