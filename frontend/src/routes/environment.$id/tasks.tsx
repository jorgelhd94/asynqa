import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/environment/page-header";
import {
  useTaskList,
  useRunTask,
  useDeleteTask,
  useArchiveTask,
  useCancelTask,
  type TaskState,
} from "@/hooks/use-queue-detail";
import { useQueues } from "@/hooks/use-queues";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  MoreHorizontal,
  Play,
  Trash2,
  XCircle,
} from "lucide-react";
import { sileo } from "sileo";
import type { queue } from "../../../wailsjs/go/models";

export const Route = createFileRoute("/environment/$id/tasks")({
  component: TasksPage,
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

type RowAction = "run" | "delete" | "archive" | "cancel";

const ROW_ACTIONS: Record<TaskState, RowAction[]> = {
  pending: ["delete", "archive"],
  active: ["cancel"],
  scheduled: ["run", "delete", "archive"],
  retry: ["run", "delete", "archive"],
  archived: ["run", "delete"],
  completed: ["delete"],
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleString("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "\u2014";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function tryFormatJSON(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}

function TasksPage() {
  const { id } = Route.useParams();
  const environmentId = Number(id);

  const { data: queuesData, isLoading: queuesLoading } = useQueues(environmentId);
  const queueNames = (queuesData?.queues ?? []).map((q) => q.queue);

  const [selectedQueue, setSelectedQueue] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TaskState>("pending");
  const [page, setPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<queue.TaskInfo | null>(null);

  const currentQueue = selectedQueue || queueNames[0] || "";

  const taskList = useTaskList(environmentId, currentQueue, activeTab, page, PAGE_SIZE);
  const runTask = useRunTask(environmentId, currentQueue);
  const deleteTask = useDeleteTask(environmentId, currentQueue);
  const archiveTask = useArchiveTask(environmentId, currentQueue);
  const cancelTask = useCancelTask(environmentId);

  const tasks = taskList.data?.tasks ?? [];
  const totalCount = taskList.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TaskState);
    setPage(1);
  };

  const handleQueueChange = (q: string) => {
    setSelectedQueue(q);
    setPage(1);
  };

  const handleTaskAction = (action: RowAction, taskID: string) => {
    const mutations = { run: runTask, delete: deleteTask, archive: archiveTask, cancel: cancelTask };
    const labels = { run: "queued", delete: "deleted", archive: "archived", cancel: "cancel signal sent" };
    mutations[action].mutate(taskID, {
      onSuccess: () => sileo.success({ title: `Task ${labels[action]}` }),
      onError: (err) => sileo.error({ title: `Failed: ${err.message}` }),
    });
  };

  const rowActions = ROW_ACTIONS[activeTab];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Browse and manage tasks across queues."
      />

      <div className="flex items-center gap-3">
        <label className="text-xs text-[--color-black-400]">Queue:</label>
        {queuesLoading ? (
          <Skeleton className="h-8 w-48 rounded-md" />
        ) : queueNames.length > 0 ? (
          <select
            value={currentQueue}
            onChange={(e) => handleQueueChange(e.target.value)}
            className="h-8 rounded-md border border-[--color-black-700] bg-[--color-black-900] px-3 text-xs text-[--color-black-50] outline-none focus:border-[--color-electric-rose-400] cursor-pointer"
          >
            {queueNames.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        ) : (
          <span className="text-xs text-[--color-black-400]">No queues available</span>
        )}
      </div>

      {currentQueue && (
        <div className="rounded-xl border border-[--color-black-800] bg-[--color-black-900]/60 backdrop-blur">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="border-b border-[--color-black-800] px-4">
              <TabsList className="h-auto bg-transparent p-0">
                {TASK_STATES.map((s) => (
                  <TabsTrigger
                    key={s.value}
                    value={s.value}
                    className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-xs data-[state=active]:border-[--color-electric-rose-400] data-[state=active]:bg-transparent data-[state=active]:text-[--color-electric-rose-300]"
                  >
                    {s.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {TASK_STATES.map((s) => (
              <TabsContent key={s.value} value={s.value} className="mt-0">
                {taskList.isLoading ? (
                  <div className="p-4">
                    <Skeleton className="h-48 rounded-lg" />
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="flex items-center justify-center py-16 text-sm text-[--color-black-400]">
                    <div className="text-center">
                      <ListChecks className="mx-auto mb-2 h-6 w-6 text-[--color-black-600]" />
                      <p>No {s.label.toLowerCase()} tasks in "{currentQueue}"</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 border-b border-[--color-black-800] px-4 py-2">
                      <span className="text-xs text-[--color-black-400]">
                        {totalCount} task(s)
                      </span>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow className="border-[--color-black-800] hover:bg-transparent">
                          <TableHead className="text-[--color-black-400]">ID</TableHead>
                          <TableHead className="text-[--color-black-400]">Type</TableHead>
                          <TableHead className="text-[--color-black-400]">Payload</TableHead>
                          {(activeTab === "scheduled" || activeTab === "retry") && (
                            <TableHead className="text-[--color-black-400]">Next Run</TableHead>
                          )}
                          {activeTab === "retry" && (
                            <TableHead className="text-[--color-black-400]">Retries</TableHead>
                          )}
                          {(activeTab === "retry" || activeTab === "archived") && (
                            <TableHead className="text-[--color-black-400]">Last Error</TableHead>
                          )}
                          {activeTab === "active" && (
                            <TableHead className="text-[--color-black-400]">Status</TableHead>
                          )}
                          {activeTab === "completed" && (
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
                            onClick={() => setSelectedTask(t)}
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
                            {(activeTab === "scheduled" || activeTab === "retry") && (
                              <TableCell className="text-xs text-[--color-black-200]">
                                {formatDate(t.nextProcessAt)}
                              </TableCell>
                            )}
                            {activeTab === "retry" && (
                              <TableCell className="text-xs">
                                <span className="text-[--color-dark-orange-400]">
                                  {t.retried}/{t.maxRetry}
                                </span>
                              </TableCell>
                            )}
                            {(activeTab === "retry" || activeTab === "archived") && (
                              <TableCell className="max-w-32 truncate text-xs text-[--color-vibrant-coral-400]">
                                {t.lastErr}
                              </TableCell>
                            )}
                            {activeTab === "active" && (
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
                            {activeTab === "completed" && (
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
                                          onClick={() => handleTaskAction(action, t.id)}
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
                            onClick={() => setPage(page - 1)}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon-xs"
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base">Task Detail</SheetTitle>
          </SheetHeader>
          {selectedTask && (
            <TaskDetailContent task={selectedTask} onAction={handleTaskAction} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

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
        <span className="text-xs font-semibold uppercase text-[--color-black-400]">Payload</span>
        <pre className="max-h-48 overflow-auto rounded-lg border border-[--color-black-800] bg-[--color-black-900] p-3 text-xs text-[--color-black-200]">
          {task.payload ? tryFormatJSON(task.payload) : "\u2014"}
        </pre>
      </div>

      {state === "completed" && task.result && (
        <>
          <Separator className="bg-[--color-black-800]" />
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase text-[--color-black-400]">Result</span>
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
            <span className="text-xs font-semibold uppercase text-[--color-black-400]">Last Error</span>
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
        <span className={`truncate text-right text-xs text-[--color-black-200] ${mono ? "font-mono" : ""}`}>
          {value || "\u2014"}
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
