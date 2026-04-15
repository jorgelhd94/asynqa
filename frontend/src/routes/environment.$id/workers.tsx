import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/environment/page-header";
import { RefreshIndicator } from "@/components/environment/refresh-indicator";
import { StatCard } from "@/components/environment/stat-card";
import { useWorkers } from "@/hooks/use-workers";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  AlertTriangle,
  HardHat,
  Server,
} from "lucide-react";
import type { worker } from "../../../wailsjs/go/models";

export const Route = createFileRoute("/environment/$id/workers")({
  component: WorkersPage,
});

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

function WorkersPage() {
  const { id } = Route.useParams();
  const environmentId = Number(id);
  const { data, isLoading, isError, error, dataUpdatedAt, isFetching, refetch } = useWorkers(environmentId);
  const [selectedServer, setSelectedServer] = useState<worker.ServerInfo | null>(null);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="space-y-6">
          <PageHeader title="Workers" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded" />
            ))}
          </div>
          <Skeleton className="h-64 rounded" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 space-y-4">
        <div className="space-y-6">
          <PageHeader title="Workers" />
          <div className="flex items-center gap-3 rounded border border-(--color-error)/30 bg-(--color-error)/10 p-4 text-sm text-(--color-error)">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              Failed to load worker data.{" "}
              {error?.message &&
                (() => {
                  try { return JSON.parse(error.message).message; }
                  catch { return error.message; }
                })()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const servers = data?.servers ?? [];

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-6">
        <PageHeader
          title="Workers"
          description="Connected worker instances processing tasks."
          actions={
            <RefreshIndicator
              intervalMs={5000}
              dataUpdatedAt={dataUpdatedAt}
              onRefresh={refetch}
              isFetching={isFetching}
            />
          }
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            title="Servers"
            value={servers.length}
            icon={Server}
          />
          <StatCard
            title="Active Workers"
            value={data?.totalWorkers ?? 0}
            subtitle="processing tasks"
            icon={HardHat}
            iconColor="text-(--color-success)"
          />
        </div>

        {servers.length > 0 ? (
          <div className="rounded border border-(--color-divider) bg-(--color-primary-light)">
            <div className="flex items-center gap-2 border-b border-(--color-divider) px-4 py-3">
              <Activity className="h-4 w-4 text-(--color-accent-val)" />
              <h2 className="text-sm font-semibold text-(--color-text-primary)">
                Server Instances
              </h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-(--color-divider) hover:bg-transparent">
                  <TableHead className="text-(--color-text-secondary)">Host</TableHead>
                  <TableHead className="text-(--color-text-secondary)">PID</TableHead>
                  <TableHead className="text-(--color-text-secondary)">Queues</TableHead>
                  <TableHead className="text-right text-(--color-text-secondary)">Concurrency</TableHead>
                  <TableHead className="text-right text-(--color-text-secondary)">Active</TableHead>
                  <TableHead className="text-(--color-text-secondary)">Started</TableHead>
                  <TableHead className="text-right text-(--color-text-secondary)">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servers.map((srv) => (
                  <TableRow
                    key={srv.id}
                    className="border-(--color-divider) hover:bg-(--color-row-hover) cursor-pointer transition-colors"
                    onClick={() => setSelectedServer(srv)}
                  >
                    <TableCell className="font-medium text-(--color-text-primary)">
                      {srv.host}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-(--color-text-secondary)">
                      {srv.pid}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(srv.queues ?? []).map((q) => (
                          <Badge key={q} variant="secondary" className="text-xs">
                            {q}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-(--color-text-secondary)">
                      {srv.concurrency}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={(srv.activeWorkers?.length ?? 0) > 0 ? "text-(--color-success)" : "text-(--color-text-secondary)"}>
                        {srv.activeWorkers?.length ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-(--color-text-secondary)">
                      {formatDate(srv.started)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          srv.status === "active"
                            ? "border-(--color-success) text-(--color-success)"
                            : "border-(--color-warning) text-(--color-warning)"
                        }
                      >
                        {srv.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded border border-dashed border-(--color-divider) py-16 text-sm text-(--color-text-secondary)">
            <div className="text-center">
              <Server className="mx-auto mb-2 h-8 w-8 text-(--color-text-muted)" />
              <p>No worker servers connected.</p>
              <p className="mt-1 text-xs">Start an asynq worker to see servers here.</p>
            </div>
          </div>
        )}

        <Sheet open={!!selectedServer} onOpenChange={(open) => !open && setSelectedServer(null)}>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-base">Server Detail</SheetTitle>
            </SheetHeader>
            {selectedServer && (
              <div className="space-y-5 pt-4">
                <div className="space-y-3">
                  <DetailRow label="ID" value={selectedServer.id} mono />
                  <DetailRow label="Host" value={selectedServer.host} />
                  <DetailRow label="PID" value={String(selectedServer.pid)} mono />
                  <DetailRow label="Concurrency" value={String(selectedServer.concurrency)} />
                  <DetailRow label="Status">
                    <Badge
                      variant="outline"
                      className={
                        selectedServer.status === "active"
                          ? "border-(--color-success) text-(--color-success)"
                          : "border-(--color-warning) text-(--color-warning)"
                      }
                    >
                      {selectedServer.status}
                    </Badge>
                  </DetailRow>
                  <DetailRow label="Started" value={formatDate(selectedServer.started)} />
                  <DetailRow label="Strict Priority" value={selectedServer.strictPriority ? "Yes" : "No"} />
                </div>

                <Separator className="bg-(--color-divider)" />

                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase text-(--color-text-secondary)">
                    Queues
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedServer.queues ?? []).map((q) => (
                      <Badge key={q} variant="secondary">{q}</Badge>
                    ))}
                  </div>
                </div>

                <Separator className="bg-(--color-divider)" />

                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase text-(--color-text-secondary)">
                    Active Workers ({selectedServer.activeWorkers?.length ?? 0})
                  </span>
                  {(selectedServer.activeWorkers?.length ?? 0) > 0 ? (
                    <div className="space-y-2">
                      {selectedServer.activeWorkers.map((w) => (
                        <div
                          key={w.taskID}
                          className="rounded-lg border border-(--color-divider) bg-(--color-primary-bg) p-3 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-(--color-text-primary)">{w.type}</span>
                            <Badge variant="secondary" className="text-xs">{w.queue}</Badge>
                          </div>
                          <div className="font-mono text-xs text-(--color-text-secondary) truncate">
                            {w.taskID}
                          </div>
                          <div className="text-xs text-(--color-text-secondary)">
                            Started: {formatDate(w.started)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-(--color-text-secondary)">No active workers</p>
                  )}
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
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
      <span className="shrink-0 text-xs text-(--color-text-secondary)">{label}</span>
      {children ?? (
        <span className={`truncate text-right text-xs text-(--color-text-secondary) ${mono ? "font-mono" : ""}`}>
          {value || "\u2014"}
        </span>
      )}
    </div>
  );
}
