import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-[var(--color-accent-val)]",
}: StatCardProps) {
  return (
    <div className="group border border-[var(--color-divider)] bg-[var(--color-primary-light)] p-3 transition-colors hover:bg-[var(--color-hover)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          {title}
        </span>
        <div className="flex h-6 w-6 items-center justify-center rounded bg-[var(--color-accent-glow)]">
          <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
        </div>
      </div>
      <div className="mt-1.5 text-lg font-bold text-[var(--color-text-primary)]">
        {value}
      </div>
      {subtitle && (
        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{subtitle}</p>
      )}
    </div>
  );
}
