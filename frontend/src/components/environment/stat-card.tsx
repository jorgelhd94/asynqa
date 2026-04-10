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
  iconColor = "text-[--color-electric-rose-300]",
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-[--color-black-800] bg-[--color-black-900]/60 p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[--color-black-400]">
          {title}
        </span>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="mt-2 text-2xl font-bold text-[--color-black-50]">
        {value}
      </div>
      {subtitle && (
        <p className="mt-0.5 text-xs text-[--color-black-400]">{subtitle}</p>
      )}
    </div>
  );
}
