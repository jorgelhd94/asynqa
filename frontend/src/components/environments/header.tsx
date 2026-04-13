type EnvironmentsHeaderProps = {
  total: number;
};

export function EnvironmentsHeader({ total }: EnvironmentsHeaderProps) {
  return (
    <div className="flex w-full max-w-md items-center justify-between gap-4 text-left">
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
        Saved environments
      </div>
      <div className="flex items-center gap-1 border border-[var(--color-divider)] bg-[var(--color-primary-light)] px-2 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
        <span className="bg-[var(--color-accent-val)]/15 px-2 py-0.5">
          {total}
        </span>
        <span className="text-[var(--color-text-muted)]">Total</span>
      </div>
    </div>
  );
}
