import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/environment/page-header";
import { StatCard } from "@/components/environment/stat-card";
import {
  useQueues,
  usePauseQueue,
  useUnpauseQueue,
  useDeleteQueue,
} from "@/hooks/use-queues";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Activity,
  AlertTriangle,
  Layers,
  ListTodo,
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
} from "lucide-react";
import { sileo } from "sileo";

export const Route = createFileRoute("/environment/$id/queues/")({
  component: QueuesPage,
});

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function QueuesPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const environmentId = Number(id);
  const { data, isLoading, isError, error } = useQueues(environmentId);
  const pauseMutation = usePauseQueue(environmentId);
  const unpauseMutation = useUnpauseQueue(environmentId);
  const deleteMutation = useDeleteQueue(environmentId);

  const [deleteTarget, setDeleteTarget] = useState<{
    name: string;
    size: number;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Queues" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Queues" />
        <div className="flex items-center gap-3 rounded-xl border border-[--color-vibrant-coral-500]/30 bg-[--color-vibrant-coral-500]/10 p-4 text-sm text-[--color-vibrant-coral-400]">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Failed to load queue data.{" "}
            {error?.message &&
              (() => {
                try {
                  return JSON.parse(error.message).message;
                } catch {
                  return error.message;
                }
              })()}
          </span>
        </div>
      </div>
    );
  }

  const queues = data?.queues ?? [];

  const handleTogglePause = (queueName: string, paused: boolean) => {
    if (paused) {
      unpauseMutation.mutate(queueName, {
        onSuccess: () => sileo.success({ title: `Queue "${queueName}" resumed` }),
        onError: (err) => sileo.error({ title: `Failed to resume queue: ${err.message}` }),
      });
    } else {
      pauseMutation.mutate(queueName, {
        onSuccess: () => sileo.success({ title: `Queue "${queueName}" paused` }),
        onError: (err) => sileo.error({ title: `Failed to pause queue: ${err.message}` }),
      });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(
      { queueName: deleteTarget.name, force: deleteTarget.size > 0 },
      {
        onSuccess: () => {
          sileo.success({ title: `Queue "${deleteTarget.name}" deleted` });
          setDeleteTarget(null);
        },
        onError: (err) => {
          sileo.error({ title: `Failed to delete queue: ${err.message}` });
          setDeleteTarget(null);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Queues"
        description="Manage and monitor task queues."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Queues"
          value={data?.totalQueues ?? 0}
          icon={Layers}
        />
        <StatCard
          title="Total Tasks"
          value={(data?.totalTasks ?? 0).toLocaleString()}
          icon={ListTodo}
          iconColor="text-[--color-dark-orange-400]"
        />
        <StatCard
          title="Active"
          value={data?.activeQueues ?? 0}
          subtitle="processing"
          icon={Play}
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Paused"
          value={data?.pausedQueues ?? 0}
          icon={Pause}
          iconColor="text-[--color-dark-orange-400]"
        />
      </div>

      {queues.length > 0 && (
        <div className="rounded-xl border border-[--color-black-800] bg-[--color-black-900]/60 backdrop-blur">
          <div className="flex items-center gap-2 border-b border-[--color-black-800] px-4 py-3">
            <Activity className="h-4 w-4 text-[--color-electric-rose-300]" />
            <h2 className="text-sm font-semibold text-[--color-black-50]">
              All Queues
            </h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-[--color-black-800] hover:bg-transparent">
                <TableHead className="text-[--color-black-400]">Queue</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Size</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Pending</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Active</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Scheduled</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Retry</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Archived</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Processed</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Failed</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Latency</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Memory</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {queues.map((q) => (
                <TableRow
                  key={q.queue}
                  className="border-[--color-black-800] hover:bg-[--color-black-800]/50 cursor-pointer"
                  onClick={() =>
                    navigate({
                      to: "/environment/$id/queues/$queueName",
                      params: { id, queueName: q.queue },
                    })
                  }
                >
                  <TableCell className="font-medium text-[--color-black-50]">
                    {q.queue}
                  </TableCell>
                  <TableCell className="text-right text-[--color-black-200]">
                    {q.size}
                  </TableCell>
                  <TableCell className="text-right text-[--color-black-200]">
                    {q.pending}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={q.active > 0 ? "text-emerald-400" : "text-[--color-black-200]"}>
                      {q.active}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-[--color-black-200]">
                    {q.scheduled}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={q.retry > 0 ? "text-[--color-dark-orange-400]" : "text-[--color-black-200]"}>
                      {q.retry}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={q.archived > 0 ? "text-[--color-vibrant-coral-400]" : "text-[--color-black-200]"}>
                      {q.archived}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-[--color-black-200]">
                    {q.processedTotal.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={q.failedTotal > 0 ? "text-[--color-vibrant-coral-400]" : "text-[--color-black-200]"}>
                      {q.failedTotal.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-[--color-black-200]">
                    {q.latencyMs}ms
                  </TableCell>
                  <TableCell className="text-right text-[--color-black-200]">
                    {formatBytes(q.memoryUsage)}
                  </TableCell>
                  <TableCell className="text-right">
                    {q.paused ? (
                      <Badge variant="outline" className="border-[--color-dark-orange-400] text-[--color-dark-orange-400]">
                        Paused
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-emerald-500 text-emerald-400">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs" className="text-[--color-black-400] hover:text-[--color-black-50]">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleTogglePause(q.queue, q.paused)}
                        >
                          {q.paused ? (
                            <>
                              <Play className="h-4 w-4" />
                              Resume
                            </>
                          ) : (
                            <>
                              <Pause className="h-4 w-4" />
                              Pause
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() =>
                            setDeleteTarget({ name: q.queue, size: q.size })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {queues.length === 0 && (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-[--color-black-700] py-16 text-sm text-[--color-black-400]">
          <div className="text-center">
            <Layers className="mx-auto mb-2 h-8 w-8 text-[--color-black-600]" />
            <p>No queues found in this environment.</p>
            <p className="mt-1 text-xs">Start an asynq worker to create queues.</p>
          </div>
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete queue &ldquo;{deleteTarget?.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && deleteTarget.size > 0
                ? `This queue has ${deleteTarget.size} task(s). All tasks will be permanently deleted. This action cannot be undone.`
                : "This empty queue will be permanently deleted. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
