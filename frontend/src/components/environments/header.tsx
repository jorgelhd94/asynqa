type EnvironmentsHeaderProps = {
  total: number;
};

export function EnvironmentsHeader({ total }: EnvironmentsHeaderProps) {
  return (
    <div className="flex w-full max-w-md items-center justify-between gap-4 text-left">
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-(--color-text-secondary)">
        Saved environments
      </div>
      <div className="flex items-center gap-1 border border-(--color-divider) bg-(--color-primary-light) px-2 py-1 text-xs font-medium text-(--color-text-secondary)">
        <span className="bg-(--color-accent-val)/15 px-2 py-0.5">
          {total}
        </span>
        <span className="text-(--color-text-muted)">Total</span>
      </div>
    </div>
  );
}
