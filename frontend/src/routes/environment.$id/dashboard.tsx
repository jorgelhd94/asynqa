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
      <div className="p-4 space-y-4">
        <PageHeader title="Dashboard" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded" />
          ))}
        </div>
        <Skeleton className="h-64 rounded" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 space-y-4">
        <PageHeader title="Dashboard" />
        <div className="flex items-center gap-3 rounded border border-[--color-error]/30 bg-[--color-error]/10 p-4 text-sm text-[--color-error]">
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
    <div className="p-4 space-y-4">
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
          iconColor="text-[--color-warning]"
        />
        <StatCard
          title="Processed"
          value={totalProcessed.toLocaleString()}
          subtitle={`${data?.totalActive ?? 0} active now`}
          icon={Zap}
          iconColor="text-[--color-success]"
        />
        <StatCard
          title="Failed"
          value={(data?.totalFailed ?? 0).toLocaleString()}
          subtitle={`${data?.serverCount ?? 0} worker(s)`}
          icon={AlertTriangle}
          iconColor="text-[--color-error]"
        />
      </div>

      {queues.length > 0 && (
        <div className="rounded border border-[--color-divider] bg-[--color-primary-light]">
          <div className="flex items-center gap-2 border-b border-[--color-divider] px-4 py-3">
            <Activity className="h-4 w-4 text-[--color-accent]" />
            <h2 className="text-sm font-semibold text-[--color-text-primary]">
              Queue Overview
            </h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-[--color-divider] hover:bg-transparent">
                <TableHead className="text-[--color-text-secondary]">Queue</TableHead>
                <TableHead className="text-right text-[--color-text-secondary]">Size</TableHead>
                <TableHead className="text-right text-[--color-text-secondary]">Pending</TableHead>
                <TableHead className="text-right text-[--color-text-secondary]">Active</TableHead>
                <TableHead className="text-right text-[--color-text-secondary]">Retry</TableHead>
                <TableHead className="text-right text-[--color-text-secondary]">Archived</TableHead>
                <TableHead className="text-right text-[--color-text-secondary]">Latency</TableHead>
                <TableHead className="text-right text-[--color-text-secondary]">Memory</TableHead>
                <TableHead className="text-right text-[--color-text-secondary]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queues.map((q) => (
                <TableRow
                  key={q.queue}
                  className="border-[--color-divider] hover:bg-[#2a2520] cursor-pointer transition-colors"
                  onClick={() =>
                    navigate({
                      to: "/environment/$id/queues/$queueName",
                      params: { id, queueName: q.queue },
                    })
                  }
                >
                  <TableCell className="font-medium text-[--color-text-primary]">
                    {q.queue}
                  </TableCell>
                  <TableCell className="text-right text-[--color-text-secondary]">
                    {q.size}
                  </TableCell>
                  <TableCell className="text-right text-[--color-text-secondary]">
                    {q.pending}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={q.active > 0 ? "text-[--color-success]" : "text-[--color-text-secondary]"}>
                      {q.active}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={q.retry > 0 ? "text-[--color-warning]" : "text-[--color-text-secondary]"}>
                      {q.retry}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={q.archived > 0 ? "text-[--color-error]" : "text-[--color-text-secondary]"}>
                      {q.archived}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-[--color-text-secondary]">
                    {q.latencyMs}ms
                  </TableCell>
                  <TableCell className="text-right text-[--color-text-secondary]">
                    {formatBytes(q.memoryUsage)}
                  </TableCell>
                  <TableCell className="text-right">
                    {q.paused ? (
                      <Badge variant="outline" className="border-[--color-warning] text-[--color-warning]">
                        Paused
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-[--color-success] text-[--color-success]">
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
        <div className="flex items-center justify-center rounded border border-dashed border-[--color-divider] py-16 text-sm text-[--color-text-secondary]">
          <div className="text-center">
            <Server className="mx-auto mb-2 h-8 w-8 text-[--color-text-muted]" />
            <p>No queues found in this environment.</p>
            <p className="mt-1 text-xs">Start an asynq worker to create queues.</p>
          </div>
        </div>
      )}

      {(data?.history?.length ?? 0) > 0 && (
        <div className="rounded border border-[--color-divider] bg-[--color-primary-light] p-4">
          <h2 className="mb-3 text-sm font-semibold text-[--color-text-primary]">
            Processing History (last 14 days)
          </h2>
          <div className="grid grid-cols-7 gap-2 lg:grid-cols-14">
            {data!.history
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((day) => (
                <div
                  key={day.date}
                  className="flex flex-col items-center gap-1 rounded-lg border border-[--color-divider] bg-[--color-primary-bg] p-2"
                >
                  <span className="text-[10px] text-[--color-text-secondary]">
                    {new Date(day.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </span>
                  <span className="text-xs font-semibold text-[--color-success]">
                    {day.processed}
                  </span>
                  {day.failed > 0 && (
                    <span className="text-[10px] text-[--color-error]">
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
