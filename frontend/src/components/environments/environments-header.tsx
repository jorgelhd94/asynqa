type EnvironmentsHeaderProps = {
  total: number
}

export function EnvironmentsHeader({ total }: EnvironmentsHeaderProps) {
  return (
    <div className="flex w-full max-w-md items-center justify-between gap-4 text-left">
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[--color-black-200]">
        Saved environments
      </div>
      <div className="flex items-center gap-1 rounded-lg border border-[--color-black-700] bg-[--color-black-900]/80 px-2 py-1 text-[11px] font-medium text-[--color-black-100] shadow-[0_10px_35px_-22px_rgba(215,40,169,0.5)]">
        <span className="rounded-md bg-[--color-electric-rose-500]/15 px-2 py-0.5 text-[--color-electric-rose-300]">
          {total}
        </span>
        <span className="text-[--color-black-300]">Total</span>
      </div>
    </div>
  )
}
