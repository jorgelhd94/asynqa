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
  iconColor = "text-[--color-accent]",
}: StatCardProps) {
  return (
    <div className="group border border-[--color-divider] bg-[--color-primary-light] p-3 transition-colors hover:bg-[--color-hover]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[--color-text-muted]">
          {title}
        </span>
        <div className="flex h-6 w-6 items-center justify-center rounded bg-[--color-accent-glow]">
          <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
        </div>
      </div>
      <div className="mt-1.5 text-lg font-bold text-[--color-text-primary]">
        {value}
      </div>
      {subtitle && (
        <p className="mt-0.5 text-[10px] text-[--color-text-secondary]">{subtitle}</p>
      )}
    </div>
  );
}
