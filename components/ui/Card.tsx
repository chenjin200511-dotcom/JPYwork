// Purpose: Provides a small reusable card foundation for future UI.
import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`interactive-card rounded-jpy-lg border border-jpy-border bg-jpy-card p-6 shadow-jpy ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
