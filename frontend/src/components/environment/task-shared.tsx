import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/environment/code-block";
import type { TaskState } from "@/hooks/use-queue-detail";
import {
  Archive,
  Play,
  Trash2,
  XCircle,
} from "lucide-react";
import type { queue } from "../../../wailsjs/go/models";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const TASK_STATES: { value: TaskState; label: string; color: string; activeColor: string }[] = [
  { value: "pending", label: "Pending", color: "text-[var(--color-text-secondary)]", activeColor: "border-[var(--color-text-secondary)] text-[var(--color-text-primary)]" },
  { value: "active", label: "Active", color: "text-[var(--color-success)]", activeColor: "border-[var(--color-success)] text-[var(--color-success)]" },
  { value: "scheduled", label: "Scheduled", color: "text-[var(--color-info)]", activeColor: "border-[var(--color-info)] text-[var(--color-info)]" },
  { value: "retry", label: "Retry", color: "text-[var(--color-warning)]", activeColor: "border-[var(--color-warning)] text-[var(--color-warning)]" },
  { value: "archived", label: "Archived", color: "text-[var(--color-error)]", activeColor: "border-[var(--color-error)] text-[var(--color-error)]" },
  { value: "completed", label: "Completed (retention)", color: "text-[var(--color-accent-val)]", activeColor: "border-[var(--color-accent-val)] text-[var(--color-accent-val)]" },
];

export const TAB_COLORS: Record<TaskState, string> = {
  pending: "#a3a3a3",
  active: "#10b981",
  scheduled: "#3b82f6",
  retry: "#f59e0b",
  archived: "#f43f5e",
  completed: "#d4a843",
};

export function getDateFieldForState(task: { lastFailedAt: string; nextProcessAt: string; completedAt: string }, state: TaskState): string {
  switch (state) {
    case "scheduled": return task.nextProcessAt;
    case "retry": return task.lastFailedAt;
    case "archived": return task.lastFailedAt;
    case "completed": return task.completedAt;
    default: return "";
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sortTasksByDate(tasks: any[], state: TaskState): any[] {
  return [...tasks].sort((a, b) => {
    const dateA = getDateFieldForState(a, state);
    const dateB = getDateFieldForState(b, state);
    if (!dateA || !dateB) return 0;
    return dateB.localeCompare(dateA);
  });
}

export const DATE_COLUMN_LABEL: Partial<Record<TaskState, string>> = {
  scheduled: "Next Run",
  retry: "Last Failed",
  archived: "Last Failed",
  completed: "Completed At",
};

export type RowAction = "run" | "delete" | "archive" | "cancel";

export const ROW_ACTIONS: Record<TaskState, RowAction[]> = {
  pending: ["delete", "archive"],
  active: ["cancel"],
  scheduled: ["run", "delete", "archive"],
  retry: ["run", "delete", "archive"],
  archived: ["run", "delete"],
  completed: ["delete"],
};

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

export function formatDate(dateStr: string): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleString("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return "\u2014";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function tryFormatJSON(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}

export function getStateCount(info: queue.QueueInfo | undefined, state: TaskState): number {
  if (!info) return 0;
  const map: Record<TaskState, number> = {
    pending: info.pending,
    active: info.active,
    scheduled: info.scheduled,
    retry: info.retry,
    archived: info.archived,
    completed: info.completed,
  };
  return map[state];
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export function StateBadge({ state }: { state: TaskState }) {
  const styles: Record<TaskState, string> = {
    pending: "border-[var(--color-text-muted)] text-[var(--color-text-secondary)]",
    active: "border-[var(--color-success)] text-[var(--color-success)]",
    scheduled: "border-[var(--color-info)] text-[var(--color-info)]",
    retry: "border-[var(--color-warning)] text-[var(--color-warning)]",
    archived: "border-[var(--color-error)] text-[var(--color-error)]",
    completed: "border-[var(--color-success)] text-[var(--color-success)]",
  };
  return (
    <Badge variant="outline" className={styles[state]}>
      {state}
    </Badge>
  );
}

export function DetailRow({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">{label}</span>
      {children ?? (
        <span className={`truncate text-right text-xs text-[var(--color-text-secondary)] ${mono ? "font-mono" : ""}`}>
          {value || "\u2014"}
        </span>
      )}
    </div>
  );
}

export function TaskDetailContent({
  task,
  onAction,
}: {
  task: queue.TaskInfo;
  onAction: (action: RowAction, taskID: string) => void;
}) {
  const state = task.state as TaskState;
  const actions = ROW_ACTIONS[state] ?? [];
  return (
    <div className="space-y-5 pt-4">
      <div className="space-y-3">
        <DetailRow label="ID" value={task.id} mono />
        <DetailRow label="Type" value={task.type} />
        <DetailRow label="State">
          <StateBadge state={state} />
        </DetailRow>
        <DetailRow label="Queue" value={task.queue} />
        {task.group && <DetailRow label="Group" value={task.group} />}
      </div>

      <Separator className="bg-[var(--color-divider)]" />

      {task.payload && (
        <CodeBlock content={task.payload} label="Payload" />
      )}

      {state === "completed" && task.result && (
        <>
          <Separator className="bg-[var(--color-divider)]" />
          <CodeBlock content={task.result} label="Result" variant="success" />
        </>
      )}

      {task.lastErr && (
        <>
          <Separator className="bg-[var(--color-divider)]" />
          <CodeBlock content={task.lastErr} label="Last Error" variant="error" maxHeight="max-h-40" />
          {task.lastFailedAt && (
            <span className="text-xs text-[var(--color-text-secondary)]">
              Failed at: {formatDate(task.lastFailedAt)}
            </span>
          )}
        </>
      )}

      <Separator className="bg-[var(--color-divider)]" />

      <div className="space-y-3">
        <DetailRow label="Max Retry" value={String(task.maxRetry)} />
        <DetailRow label="Retried" value={String(task.retried)} />
        {task.nextProcessAt && <DetailRow label="Next Run" value={formatDate(task.nextProcessAt)} />}
        {task.completedAt && <DetailRow label="Completed" value={formatDate(task.completedAt)} />}
        {task.deadline && <DetailRow label="Deadline" value={formatDate(task.deadline)} />}
        <DetailRow label="Timeout" value={formatDuration(task.timeoutSecs)} />
        <DetailRow label="Retention" value={formatDuration(task.retentionSecs)} />
        {task.isOrphaned && (
          <DetailRow label="Orphaned">
            <Badge variant="outline" className="border-[var(--color-error)] text-[var(--color-error)]">
              Yes
            </Badge>
          </DetailRow>
        )}
      </div>

      {actions.length > 0 && (
        <>
          <Separator className="bg-[var(--color-divider)]" />
          <div className="flex gap-2">
            {actions.map((action) => (
              <Button
                key={action}
                variant={action === "delete" ? "destructive" : "outline"}
                size="sm"
                onClick={() => onAction(action, task.id)}
              >
                {action === "run" && <><Play className="h-4 w-4" /> Run</>}
                {action === "archive" && <><Archive className="h-4 w-4" /> Archive</>}
                {action === "delete" && <><Trash2 className="h-4 w-4" /> Delete</>}
                {action === "cancel" && <><XCircle className="h-4 w-4" /> Cancel</>}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
