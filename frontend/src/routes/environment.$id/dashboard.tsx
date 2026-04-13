import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/environment/page-header";
import { StatCard } from "@/components/environment/stat-card";
import { useDashboard } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  AlertTriangle,
  Clock,
  Layers,
  Server,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/environment/$id/dashboard")({
  component: DashboardPage,
});

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function DashboardPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useDashboard(Number(id));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" />
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
        <PageHeader title="Dashboard" />
        <div className="flex items-center gap-3 rounded-xl border border-[--color-vibrant-coral-500]/30 bg-[--color-vibrant-coral-500]/10 p-4 text-sm text-[--color-vibrant-coral-400]">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Failed to load dashboard data.{" "}
            {error?.message && (() => {
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
  const totalProcessed = queues.reduce((sum, q) => sum + q.processedTotal, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Queue statistics and overview for this environment."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Queues"
          value={queues.length}
          icon={Layers}
        />
        <StatCard
          title="Total Tasks"
          value={data?.totalTasks ?? 0}
          subtitle={`${data?.totalPending ?? 0} pending`}
          icon={Clock}
          iconColor="text-[--color-dark-orange-400]"
        />
        <StatCard
          title="Processed"
          value={totalProcessed.toLocaleString()}
          subtitle={`${data?.totalActive ?? 0} active now`}
          icon={Zap}
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Failed"
          value={(data?.totalFailed ?? 0).toLocaleString()}
          subtitle={`${data?.serverCount ?? 0} worker(s)`}
          icon={AlertTriangle}
          iconColor="text-[--color-vibrant-coral-400]"
        />
      </div>

      {queues.length > 0 && (
        <div className="rounded-xl border border-[--color-black-800] bg-[--color-black-900]/60 backdrop-blur">
          <div className="flex items-center gap-2 border-b border-[--color-black-800] px-4 py-3">
            <Activity className="h-4 w-4 text-[--color-electric-rose-300]" />
            <h2 className="text-sm font-semibold text-[--color-black-50]">
              Queue Overview
            </h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-[--color-black-800] hover:bg-transparent">
                <TableHead className="text-[--color-black-400]">Queue</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Size</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Pending</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Active</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Retry</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Archived</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Latency</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Memory</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Status</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {queues.length === 0 && (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-[--color-black-700] py-16 text-sm text-[--color-black-400]">
          <div className="text-center">
            <Server className="mx-auto mb-2 h-8 w-8 text-[--color-black-600]" />
            <p>No queues found in this environment.</p>
            <p className="mt-1 text-xs">Start an asynq worker to create queues.</p>
          </div>
        </div>
      )}

      {(data?.history?.length ?? 0) > 0 && (
        <div className="rounded-xl border border-[--color-black-800] bg-[--color-black-900]/60 p-4 backdrop-blur">
          <h2 className="mb-3 text-sm font-semibold text-[--color-black-50]">
            Processing History (last 14 days)
          </h2>
          <div className="grid grid-cols-7 gap-2 lg:grid-cols-14">
            {data!.history
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((day) => (
                <div
                  key={day.date}
                  className="flex flex-col items-center gap-1 rounded-lg border border-[--color-black-800] bg-[--color-black-900]/40 p-2"
                >
                  <span className="text-[10px] text-[--color-black-400]">
                    {new Date(day.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">
                    {day.processed}
                  </span>
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
    </div>
  );
}
