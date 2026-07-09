// Purpose: Provides a compact label primitive for statuses and metadata.
type PillProps = {
  children: React.ReactNode;
  className?: string;
};

export function Pill({ children, className = "" }: PillProps) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-jpy-sm border border-jpy-border bg-jpy-block px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-jpy-muted ${className}`}
    >
      {children}
    </span>
  );
}
