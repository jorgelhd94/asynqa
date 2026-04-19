import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/environment/page-header";
import { StatCard } from "@/components/environment/stat-card";
import { RefreshIndicator } from "@/components/environment/refresh-indicator";
import { ErrorState } from "@/components/environment/error-state";
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
import { QueueSizeChart } from "@/components/dashboard/queue-size-chart";
import { HistoryChart } from "@/components/dashboard/history-chart";
import { TaskDistributionChart } from "@/components/dashboard/task-distribution-chart";

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

function ChartCard({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="rounded border border-(--color-divider) bg-(--color-primary-light)">
      <div className="flex items-center gap-2 border-b border-(--color-divider) px-4 py-3">
        <Icon className="h-4 w-4 text-(--color-accent-val)" />
        <h2 className="text-sm font-semibold text-(--color-text-primary)">{title}</h2>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

function DashboardPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, dataUpdatedAt, isFetching, refetch } = useDashboard(Number(id));

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <PageHeader title="Dashboard" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[340px] rounded" />
          <Skeleton className="h-[340px] rounded" />
        </div>
        <Skeleton className="h-64 rounded" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 space-y-4">
        <PageHeader title="Dashboard" />
        <ErrorState
          title="Failed to load dashboard data"
          error={error}
          onRetry={refetch}
          isRetrying={isFetching}
        />
      </div>
    );
  }

  const queues = data?.queues ?? [];
  const totalProcessed = queues.reduce((sum, q) => sum + q.processedTotal, 0);

  return (
    <div className="p-4 space-y-4">
      <PageHeader
        title="Dashboard"
        actions={
          <RefreshIndicator intervalMs={5000} dataUpdatedAt={dataUpdatedAt} onRefresh={refetch} isFetching={isFetching} />
        }
      />

      {/* Stat cards */}
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
          iconColor="text-(--color-warning)"
        />
        <StatCard
          title="Processed"
          value={totalProcessed.toLocaleString()}
          subtitle={`${data?.totalActive ?? 0} active now`}
          icon={Zap}
          iconColor="text-(--color-success)"
        />
        <StatCard
          title="Failed"
          value={(data?.totalFailed ?? 0).toLocaleString()}
          subtitle={`${data?.serverCount ?? 0} worker(s)`}
          icon={AlertTriangle}
          iconColor="text-(--color-error)"
        />
      </div>

      {/* Charts row */}
      {queues.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Queue Size" icon={Layers}>
            <QueueSizeChart queues={queues} />
          </ChartCard>
          <ChartCard title="Task Distribution" icon={Activity}>
            <TaskDistributionChart queues={queues} />
          </ChartCard>
        </div>
      )}

      {/* History chart */}
      {(data?.history?.length ?? 0) > 0 && (
        <ChartCard title="Tasks Processed (last 14 days)" icon={Zap}>
          <HistoryChart history={data!.history} />
        </ChartCard>
      )}

      {/* Queue overview table */}
      {queues.length > 0 && (
        <div className="rounded border border-(--color-divider) bg-(--color-primary-light)">
          <div className="flex items-center gap-2 border-b border-(--color-divider) px-4 py-3">
            <Server className="h-4 w-4 text-(--color-accent-val)" />
            <h2 className="text-sm font-semibold text-(--color-text-primary)">
              Queue Overview
            </h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-(--color-divider) hover:bg-transparent">
                <TableHead className="text-(--color-text-secondary)">Queue</TableHead>
                <TableHead className="text-right text-(--color-text-secondary)">Size</TableHead>
                <TableHead className="text-right text-(--color-text-secondary)">Pending</TableHead>
                <TableHead className="text-right text-(--color-text-secondary)">Active</TableHead>
                <TableHead className="text-right text-(--color-text-secondary)">Retry</TableHead>
                <TableHead className="text-right text-(--color-text-secondary)">Archived</TableHead>
                <TableHead className="text-right text-(--color-text-secondary)">Latency</TableHead>
                <TableHead className="text-right text-(--color-text-secondary)">Memory</TableHead>
                <TableHead className="text-right text-(--color-text-secondary)">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queues.map((q) => (
                <TableRow
                  key={q.queue}
                  className="border-(--color-divider) hover:bg-(--color-row-hover) cursor-pointer transition-colors"
                  onClick={() =>
                    navigate({
                      to: "/environment/$id/queues/$queueName",
                      params: { id, queueName: q.queue },
                    })
                  }
                >
                  <TableCell className="font-medium text-(--color-text-primary)">
                    {q.queue}
                  </TableCell>
                  <TableCell className="text-right text-(--color-text-secondary)">
                    {q.size}
                  </TableCell>
                  <TableCell className="text-right text-(--color-text-secondary)">
                    {q.pending}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={q.active > 0 ? "text-(--color-success)" : "text-(--color-text-secondary)"}>
                      {q.active}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={q.retry > 0 ? "text-(--color-warning)" : "text-(--color-text-secondary)"}>
                      {q.retry}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={q.archived > 0 ? "text-(--color-error)" : "text-(--color-text-secondary)"}>
                      {q.archived}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-(--color-text-secondary)">
                    {q.latencyMs}ms
                  </TableCell>
                  <TableCell className="text-right text-(--color-text-secondary)">
                    {formatBytes(q.memoryUsage)}
                  </TableCell>
                  <TableCell className="text-right">
                    {q.paused ? (
                      <Badge variant="outline" className="border-(--color-warning) text-(--color-warning)">
                        Paused
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-(--color-success) text-(--color-success)">
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
        <div className="flex items-center justify-center rounded border border-dashed border-(--color-divider) py-16 text-sm text-(--color-text-secondary)">
          <div className="text-center">
            <Server className="mx-auto mb-2 h-8 w-8 text-(--color-text-muted)" />
            <p>No queues found in this environment.</p>
            <p className="mt-1 text-xs">Start an asynq worker to create queues.</p>
          </div>
        </div>
      )}
    </div>
  );
}
