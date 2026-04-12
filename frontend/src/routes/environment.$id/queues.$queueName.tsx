import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/environment/page-header";
import { StatCard } from "@/components/environment/stat-card";
import {
  useQueueDetail,
  useTaskList,
  useRunTask,
  useDeleteTask,
  useArchiveTask,
  useCancelTask,
  useBulkRunTasks,
  useBulkDeleteTasks,
  useBulkArchiveTasks,
  type TaskState,
} from "@/hooks/use-queue-detail";
import { usePauseQueue, useUnpauseQueue, useDeleteQueue } from "@/hooks/use-queues";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  AlertTriangle,
  Archive,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";
import { sileo } from "sileo";
import type { queue } from "../../../wailsjs/go/models";

export const Route = createFileRoute("/environment/$id/queues/$queueName")({
  component: QueueDetailPage,
});

const PAGE_SIZE = 20;

const TASK_STATES: { value: TaskState; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "retry", label: "Retry" },
  { value: "archived", label: "Archived" },
  { value: "completed", label: "Completed" },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function tryFormatJSON(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}

function getStateCount(info: queue.QueueInfo | undefined, state: TaskState): number {
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

function QueueDetailPage() {
  const { id, queueName } = Route.useParams();
  const navigate = useNavigate();
  const environmentId = Number(id);

  const { data, isLoading, isError, error } = useQueueDetail(environmentId, queueName);
  const pauseMutation = usePauseQueue(environmentId);
  const unpauseMutation = useUnpauseQueue(environmentId);
  const deleteMutation = useDeleteQueue(environmentId);

  const [activeTab, setActiveTab] = useState<TaskState>("pending");
  const [page, setPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<queue.TaskInfo | null>(null);
  const [deleteQueueOpen, setDeleteQueueOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<{
    type: "run" | "archive" | "delete";
    state: TaskState;
  } | null>(null);

  const taskList = useTaskList(environmentId, queueName, activeTab, page, PAGE_SIZE);

  const runTask = useRunTask(environmentId, queueName);
  const deleteTask = useDeleteTask(environmentId, queueName);
  const archiveTask = useArchiveTask(environmentId, queueName);
  const cancelTask = useCancelTask(environmentId);
  const bulkRun = useBulkRunTasks(environmentId, queueName);
  const bulkDelete = useBulkDeleteTasks(environmentId, queueName);
  const bulkArchive = useBulkArchiveTasks(environmentId, queueName);

  const info = data?.info;
  const history = data?.history ?? [];
  const tasks = taskList.data?.tasks ?? [];
  const totalCount = taskList.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TaskState);
    setPage(1);
  };

  const handleTogglePause = () => {
    if (!info) return;
    if (info.paused) {
      unpauseMutation.mutate(queueName, {
        onSuccess: () => sileo.success({ title: `Queue "${queueName}" resumed` }),
        onError: (err) => sileo.error({ title: `Failed to resume: ${err.message}` }),
      });
    } else {
      pauseMutation.mutate(queueName, {
        onSuccess: () => sileo.success({ title: `Queue "${queueName}" paused` }),
        onError: (err) => sileo.error({ title: `Failed to pause: ${err.message}` }),
      });
    }
  };

  const handleDeleteQueue = () => {
    deleteMutation.mutate(
      { queueName, force: (info?.size ?? 0) > 0 },
      {
        onSuccess: () => {
          sileo.success({ title: `Queue "${queueName}" deleted` });
          navigate({ to: "/environment/$id/queues", params: { id } });
        },
        onError: (err) => sileo.error({ title: `Failed to delete: ${err.message}` }),
        onSettled: () => setDeleteQueueOpen(false),
      }
    );
  };

  const handleTaskAction = (action: "run" | "delete" | "archive" | "cancel", taskID: string) => {
    const mutations = { run: runTask, delete: deleteTask, archive: archiveTask, cancel: cancelTask };
    const labels = { run: "queued", delete: "deleted", archive: "archived", cancel: "cancel signal sent" };
    mutations[action].mutate(taskID, {
      onSuccess: () => sileo.success({ title: `Task ${labels[action]}` }),
      onError: (err) => sileo.error({ title: `Failed: ${err.message}` }),
    });
  };

  const handleBulkAction = () => {
    if (!bulkAction) return;
    const { type, state } = bulkAction;
    const mutationMap = { run: bulkRun, delete: bulkDelete, archive: bulkArchive };
    mutationMap[type].mutate(state as any, {
      onSuccess: (result: any) =>
        sileo.success({ title: `${result.count} task(s) ${type === `run` ? `queued` : type + `d`}` }),
      onError: (err: any) => sileo.error({ title: `Failed: ${err.message}` }),
      onSettled: () => setBulkAction(null),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={queueName} />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title={queueName} />
        <div className="flex items-center gap-3 rounded-xl border border-[--color-vibrant-coral-500]/30 bg-[--color-vibrant-coral-500]/10 p-4 text-sm text-[--color-vibrant-coral-400]">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Failed to load queue data.{" "}
            {error?.message &&
              (() => {
                try { return JSON.parse(error.message).message; }
                catch { return error.message; }
              })()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={queueName}
        description="Queue detail and task management."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/environment/$id/queues" params={{ id }}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTogglePause}
              disabled={pauseMutation.isPending || unpauseMutation.isPending}
            >
              {info?.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {info?.paused ? "Resume" : "Pause"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteQueueOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Size"
          value={info?.size ?? 0}
          subtitle={info?.paused ? "paused" : "active"}
          icon={Layers}
        />
        <StatCard
          title="Processed"
          value={(info?.processedTotal ?? 0).toLocaleString()}
          subtitle={`${info?.processed ?? 0} today`}
          icon={Zap}
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Failed"
          value={(info?.failedTotal ?? 0).toLocaleString()}
          subtitle={`${info?.failed ?? 0} today`}
          icon={AlertTriangle}
          iconColor="text-[--color-vibrant-coral-400]"
        />
        <StatCard
          title="Latency"
          value={`${info?.latencyMs ?? 0}ms`}
          subtitle={formatBytes(info?.memoryUsage ?? 0)}
          icon={Clock}
          iconColor="text-[--color-dark-orange-400]"
        />
      </div>

      {/* Processing history */}
      {history.length > 0 && (
        <div className="rounded-xl border border-[--color-black-800] bg-[--color-black-900]/60 p-4 backdrop-blur">
          <h2 className="mb-3 text-sm font-semibold text-[--color-black-50]">
            Processing History (last 14 days)
          </h2>
          <div className="grid grid-cols-7 gap-2 lg:grid-cols-14">
            {history
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((day) => (
                <div
                  key={day.date}
                  className="flex flex-col items-center gap-1 rounded-lg border border-[--color-black-800] bg-[--color-black-900]/40 p-2"
                >
                  <span className="text-[10px] text-[--color-black-400]">
                    {new Date(day.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">{day.processed}</span>
                  {day.failed > 0 && (
                    <span className="text-[10px] text-[--color-vibrant-coral-400]">
                      {day.failed} failed
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Task browser */}
      <div className="rounded-xl border border-[--color-black-800] bg-[--color-black-900]/60 backdrop-blur">
        <div className="flex items-center gap-2 border-b border-[--color-black-800] px-4 py-3">
          <Activity className="h-4 w-4 text-[--color-electric-rose-300]" />
          <h2 className="text-sm font-semibold text-[--color-black-50]">Tasks</h2>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="border-b border-[--color-black-800] px-4">
            <TabsList className="h-auto bg-transparent p-0">
              {TASK_STATES.map((s) => {
                const count = getStateCount(info, s.value);
                return (
                  <TabsTrigger
                    key={s.value}
                    value={s.value}
                    className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-xs data-[state=active]:border-[--color-electric-rose-400] data-[state=active]:bg-transparent data-[state=active]:text-[--color-electric-rose-300]"
                  >
                    {s.label}
                    {count > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1.5 h-5 min-w-5 px-1 text-[10px]"
                      >
                        {count}
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {TASK_STATES.map((s) => (
            <TabsContent key={s.value} value={s.value} className="mt-0">
              <TaskStateContent
                state={s.value}
                tasks={activeTab === s.value ? tasks : []}
                totalCount={activeTab === s.value ? totalCount : 0}
                page={page}
                totalPages={totalPages}
                isLoading={taskList.isLoading}
                onPageChange={setPage}
                onTaskAction={handleTaskAction}
                onTaskSelect={setSelectedTask}
                onBulkAction={(type) => setBulkAction({ type, state: s.value })}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Task detail sheet */}
      <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base">Task Detail</SheetTitle>
          </SheetHeader>
          {selectedTask && <TaskDetailContent task={selectedTask} onAction={handleTaskAction} />}
        </SheetContent>
      </Sheet>

      {/* Delete queue dialog */}
      <AlertDialog open={deleteQueueOpen} onOpenChange={setDeleteQueueOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete queue &ldquo;{queueName}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              {(info?.size ?? 0) > 0
                ? `This queue has ${info!.size} task(s). All tasks will be permanently deleted. This action cannot be undone.`
                : "This empty queue will be permanently deleted. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteQueue}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk action dialog */}
      <AlertDialog open={!!bulkAction} onOpenChange={(open) => !open && setBulkAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction?.type === "run" && "Run all tasks?"}
              {bulkAction?.type === "archive" && "Archive all tasks?"}
              {bulkAction?.type === "delete" && "Delete all tasks?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction?.type === "run" &&
                `All ${bulkAction.state} tasks will be moved to pending for immediate processing.`}
              {bulkAction?.type === "archive" &&
                `All ${bulkAction.state} tasks will be archived.`}
              {bulkAction?.type === "delete" &&
                `All ${bulkAction.state} tasks will be permanently deleted. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={bulkAction?.type === "delete" ? "destructive" : "default"}
              onClick={handleBulkAction}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task state content (bulk actions bar + table + pagination)
// ---------------------------------------------------------------------------

type BulkActionType = "run" | "archive" | "delete";

const BULK_ACTIONS: Record<TaskState, BulkActionType[]> = {
  pending: ["archive", "delete"],
  active: [],
  scheduled: ["run", "archive", "delete"],
  retry: ["run", "archive", "delete"],
  archived: ["run", "delete"],
  completed: ["delete"],
};

const BULK_LABELS: Record<BulkActionType, { label: string; icon: typeof Play }> = {
  run: { label: "Run All", icon: Play },
  archive: { label: "Archive All", icon: Archive },
  delete: { label: "Delete All", icon: Trash2 },
};

type RowAction = "run" | "delete" | "archive" | "cancel";

const ROW_ACTIONS: Record<TaskState, RowAction[]> = {
  pending: ["delete", "archive"],
  active: ["cancel"],
  scheduled: ["run", "delete", "archive"],
  retry: ["run", "delete", "archive"],
  archived: ["run", "delete"],
  completed: ["delete"],
};

function TaskStateContent({
  state,
  tasks,
  totalCount,
  page,
  totalPages,
  isLoading,
  onPageChange,
  onTaskAction,
  onTaskSelect,
  onBulkAction,
}: {
  state: TaskState;
  tasks: queue.TaskInfo[];
  totalCount: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (p: number) => void;
  onTaskAction: (action: RowAction, taskID: string) => void;
  onTaskSelect: (task: queue.TaskInfo) => void;
  onBulkAction: (type: BulkActionType) => void;
}) {
  const bulkActions = BULK_ACTIONS[state];
  const rowActions = ROW_ACTIONS[state];

  return (
    <div>
      {/* Bulk actions */}
      {bulkActions.length > 0 && totalCount > 0 && (
        <div className="flex items-center gap-2 border-b border-[--color-black-800] px-4 py-2">
          <span className="text-xs text-[--color-black-400]">
            {totalCount} task(s)
          </span>
          <div className="ml-auto flex gap-1.5">
            {bulkActions.map((action) => {
              const { label, icon: Icon } = BULK_LABELS[action];
              return (
                <Button
                  key={action}
                  variant={action === "delete" ? "destructive" : "outline"}
                  size="xs"
                  onClick={() => onBulkAction(action)}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="p-4">
          <Skeleton className="h-48 rounded-lg" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-[--color-black-400]">
          No {state} tasks
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="border-[--color-black-800] hover:bg-transparent">
                <TableHead className="text-[--color-black-400]">ID</TableHead>
                <TableHead className="text-[--color-black-400]">Type</TableHead>
                <TableHead className="text-[--color-black-400]">Payload</TableHead>
                {(state === "scheduled" || state === "retry") && (
                  <TableHead className="text-[--color-black-400]">Next Run</TableHead>
                )}
                {state === "retry" && (
                  <TableHead className="text-[--color-black-400]">Retries</TableHead>
                )}
                {(state === "retry" || state === "archived") && (
                  <TableHead className="text-[--color-black-400]">Last Error</TableHead>
                )}
                {state === "active" && (
                  <TableHead className="text-[--color-black-400]">Status</TableHead>
                )}
                {state === "completed" && (
                  <TableHead className="text-[--color-black-400]">Completed</TableHead>
                )}
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((t) => (
                <TableRow
                  key={t.id}
                  className="border-[--color-black-800] hover:bg-[--color-black-800]/50 cursor-pointer"
                  onClick={() => onTaskSelect(t)}
                >
                  <TableCell className="font-mono text-xs text-[--color-black-200]">
                    {t.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="font-medium text-[--color-black-50]">
                    {t.type}
                  </TableCell>
                  <TableCell className="max-w-48 truncate text-xs text-[--color-black-300]">
                    {t.payload?.slice(0, 60)}
                  </TableCell>
                  {(state === "scheduled" || state === "retry") && (
                    <TableCell className="text-xs text-[--color-black-200]">
                      {formatDate(t.nextProcessAt)}
                    </TableCell>
                  )}
                  {state === "retry" && (
                    <TableCell className="text-xs">
                      <span className="text-[--color-dark-orange-400]">
                        {t.retried}/{t.maxRetry}
                      </span>
                    </TableCell>
                  )}
                  {(state === "retry" || state === "archived") && (
                    <TableCell className="max-w-32 truncate text-xs text-[--color-vibrant-coral-400]">
                      {t.lastErr}
                    </TableCell>
                  )}
                  {state === "active" && (
                    <TableCell>
                      {t.isOrphaned ? (
                        <Badge variant="outline" className="border-[--color-vibrant-coral-500] text-[--color-vibrant-coral-400] text-[10px]">
                          Orphaned
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-emerald-500 text-emerald-400 text-[10px]">
                          Running
                        </Badge>
                      )}
                    </TableCell>
                  )}
                  {state === "completed" && (
                    <TableCell className="text-xs text-[--color-black-200]">
                      {formatDate(t.completedAt)}
                    </TableCell>
                  )}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {rowActions.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-xs" className="text-[--color-black-400] hover:text-[--color-black-50]">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {rowActions.map((action, i) => (
                            <div key={action}>
                              {i > 0 && action === "delete" && <DropdownMenuSeparator />}
                              <DropdownMenuItem
                                variant={action === "delete" ? "destructive" : undefined}
                                onClick={() => onTaskAction(action, t.id)}
                              >
                                {action === "run" && <><Play className="h-4 w-4" /> Run</>}
                                {action === "archive" && <><Archive className="h-4 w-4" /> Archive</>}
                                {action === "delete" && <><Trash2 className="h-4 w-4" /> Delete</>}
                                {action === "cancel" && <><XCircle className="h-4 w-4" /> Cancel</>}
                              </DropdownMenuItem>
                            </div>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[--color-black-800] px-4 py-3">
              <span className="text-xs text-[--color-black-400]">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="icon-xs"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-xs"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task detail sheet content
// ---------------------------------------------------------------------------

function TaskDetailContent({
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

      <Separator className="bg-[--color-black-800]" />

      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase text-[--color-black-400]">
          Payload
        </span>
        <pre className="max-h-48 overflow-auto rounded-lg border border-[--color-black-800] bg-[--color-black-900] p-3 text-xs text-[--color-black-200]">
          {task.payload ? tryFormatJSON(task.payload) : "—"}
        </pre>
      </div>

      {state === "completed" && task.result && (
        <>
          <Separator className="bg-[--color-black-800]" />
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase text-[--color-black-400]">
              Result
            </span>
            <pre className="max-h-48 overflow-auto rounded-lg border border-[--color-black-800] bg-[--color-black-900] p-3 text-xs text-emerald-400">
              {tryFormatJSON(task.result)}
            </pre>
          </div>
        </>
      )}

      {task.lastErr && (
        <>
          <Separator className="bg-[--color-black-800]" />
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase text-[--color-black-400]">
              Last Error
            </span>
            <pre className="max-h-32 overflow-auto rounded-lg border border-[--color-vibrant-coral-500]/20 bg-[--color-vibrant-coral-500]/5 p-3 text-xs text-[--color-vibrant-coral-400]">
              {task.lastErr}
            </pre>
            {task.lastFailedAt && (
              <span className="text-[10px] text-[--color-black-400]">
                Failed at: {formatDate(task.lastFailedAt)}
              </span>
            )}
          </div>
        </>
      )}

      <Separator className="bg-[--color-black-800]" />

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
            <Badge variant="outline" className="border-[--color-vibrant-coral-500] text-[--color-vibrant-coral-400]">
              Yes
            </Badge>
          </DetailRow>
        )}
      </div>

      {actions.length > 0 && (
        <>
          <Separator className="bg-[--color-black-800]" />
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

function DetailRow({
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
      <span className="shrink-0 text-xs text-[--color-black-400]">{label}</span>
      {children ?? (
        <span
          className={`truncate text-right text-xs text-[--color-black-200] ${mono ? `font-mono` : ``}`}
        >
          {value || "—"}
        </span>
      )}
    </div>
  );
}

function StateBadge({ state }: { state: TaskState }) {
  const styles: Record<TaskState, string> = {
    pending: "border-[--color-black-500] text-[--color-black-300]",
    active: "border-emerald-500 text-emerald-400",
    scheduled: "border-blue-500 text-blue-400",
    retry: "border-[--color-dark-orange-400] text-[--color-dark-orange-400]",
    archived: "border-[--color-vibrant-coral-500] text-[--color-vibrant-coral-400]",
    completed: "border-emerald-500 text-emerald-400",
  };
  return (
    <Badge variant="outline" className={styles[state]}>
      {state}
    </Badge>
  );
}
