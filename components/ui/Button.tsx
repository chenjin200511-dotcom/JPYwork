// Purpose: Provides a small reusable button foundation for future UI.
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-jpy-dark bg-jpy-dark text-jpy-background hover:border-jpy-accent hover:text-jpy-background",
  secondary:
    "border-jpy-border bg-jpy-card text-jpy-text hover:border-jpy-accent hover:text-jpy-accent",
  ghost:
    "border-transparent bg-transparent text-jpy-muted hover:border-jpy-accent hover:text-jpy-accent",
};

export function Button({
  className = "",
  variant = "secondary",
  ...props
}: ButtonProps) {
  const patternClass = variant === "primary" ? "primary-action" : "";

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-jpy border px-5 py-2.5 text-sm font-medium tracking-[0.04em] transition duration-200 active:translate-y-px ${patternClass} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
