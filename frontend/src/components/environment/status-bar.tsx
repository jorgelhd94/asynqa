import { useEnvironment } from "@/hooks/use-environment";
import { useDashboard } from "@/hooks/use-dashboard";
import { Circle, Layers, ListChecks, HardHat } from "lucide-react";

type StatusBarProps = {
  environmentId: number;
};

export function StatusBar({ environmentId }: StatusBarProps) {
  const { data: environment } = useEnvironment(environmentId);
  const { data: dashboard } = useDashboard(environmentId);

  const queueCount = dashboard?.queues?.length ?? 0;
  const totalTasks = dashboard?.totalTasks ?? 0;
  const serverCount = dashboard?.serverCount ?? 0;

  return (
    <div className="flex h-7 shrink-0 items-center justify-between border-t border-[var(--color-divider)] bg-[var(--color-primary-bg)] px-3 text-xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Circle className="h-2 w-2 fill-[var(--color-accent-val)] text-[var(--color-accent-val)]" />
          <span className="font-semibold text-[var(--color-accent-light)]">
            {environment?.Name ?? "..."}
          </span>
        </div>
        <span className="text-[var(--color-text-muted)]">
          {environment?.Host}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-[var(--color-text-muted)]">
          <Layers className="h-2.5 w-2.5 text-[var(--color-info)]" />
          <span>Queues: <span className="text-[var(--color-text-secondary)]">{queueCount}</span></span>
        </div>
        <div className="flex items-center gap-1 text-[var(--color-text-muted)]">
          <ListChecks className="h-2.5 w-2.5 text-[var(--color-warning)]" />
          <span>Tasks: <span className="text-[var(--color-text-secondary)]">{totalTasks}</span></span>
        </div>
        <div className="flex items-center gap-1 text-[var(--color-text-muted)]">
          <HardHat className="h-2.5 w-2.5 text-[var(--color-accent-val)]" />
          <span>Workers: <span className="text-[var(--color-text-secondary)]">{serverCount}</span></span>
        </div>
      </div>
    </div>
  );
}
