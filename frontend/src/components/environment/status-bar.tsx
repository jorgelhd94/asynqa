import { useEnvironment } from "@/hooks/use-environment";
import { useDashboard } from "@/hooks/use-dashboard";
import { UpdateIndicator } from "@/components/environment/update-indicator";
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
    <div className="flex h-7 shrink-0 items-center justify-between border-b border-(--color-divider) bg-(--color-primary-bg) px-3 text-xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Circle className="h-2 w-2 fill-(--color-accent-val) text-(--color-accent-val)" />
          <span className="font-semibold text-(--color-accent-light)">
            {environment?.Name ?? "..."}
          </span>
        </div>
        <span className="text-(--color-text-muted)">
          {environment?.Host}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <UpdateIndicator />
        <div className="flex items-center gap-1 text-(--color-text-muted)">
          <Layers className="h-2.5 w-2.5 text-(--color-info)" />
          <span>Queues: <span className="text-(--color-text-secondary)">{queueCount}</span></span>
        </div>
        <div className="flex items-center gap-1 text-(--color-text-muted)">
          <ListChecks className="h-2.5 w-2.5 text-(--color-warning)" />
          <span>Tasks: <span className="text-(--color-text-secondary)">{totalTasks}</span></span>
        </div>
        <div className="flex items-center gap-1 text-(--color-text-muted)">
          <HardHat className="h-2.5 w-2.5 text-(--color-accent-val)" />
          <span>Workers: <span className="text-(--color-text-secondary)">{serverCount}</span></span>
        </div>
      </div>
    </div>
  );
}
