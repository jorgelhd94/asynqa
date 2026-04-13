import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/environment/page-header";
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
  const { data, isLoading, isError, error } = useWorkers(environmentId);
  const [selectedServer, setSelectedServer] = useState<worker.ServerInfo | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Workers" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 2 }).map((_, i) => (
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
        <PageHeader title="Workers" />
        <div className="flex items-center gap-3 rounded-xl border border-[--color-vibrant-coral-500]/30 bg-[--color-vibrant-coral-500]/10 p-4 text-sm text-[--color-vibrant-coral-400]">
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
    );
  }

  const servers = data?.servers ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workers"
        description="Connected worker instances processing tasks."
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
          iconColor="text-emerald-400"
        />
      </div>

      {servers.length > 0 ? (
        <div className="rounded-xl border border-[--color-black-800] bg-[--color-black-900]/60 backdrop-blur">
          <div className="flex items-center gap-2 border-b border-[--color-black-800] px-4 py-3">
            <Activity className="h-4 w-4 text-[--color-electric-rose-300]" />
            <h2 className="text-sm font-semibold text-[--color-black-50]">
              Server Instances
            </h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-[--color-black-800] hover:bg-transparent">
                <TableHead className="text-[--color-black-400]">Host</TableHead>
                <TableHead className="text-[--color-black-400]">PID</TableHead>
                <TableHead className="text-[--color-black-400]">Queues</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Concurrency</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Active</TableHead>
                <TableHead className="text-[--color-black-400]">Started</TableHead>
                <TableHead className="text-right text-[--color-black-400]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servers.map((srv) => (
                <TableRow
                  key={srv.id}
                  className="border-[--color-black-800] hover:bg-[--color-black-800]/50 cursor-pointer"
                  onClick={() => setSelectedServer(srv)}
                >
                  <TableCell className="font-medium text-[--color-black-50]">
                    {srv.host}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[--color-black-200]">
                    {srv.pid}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(srv.queues ?? []).map((q) => (
                        <Badge key={q} variant="secondary" className="text-[10px]">
                          {q}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-[--color-black-200]">
                    {srv.concurrency}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={(srv.activeWorkers?.length ?? 0) > 0 ? "text-emerald-400" : "text-[--color-black-200]"}>
                      {srv.activeWorkers?.length ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-[--color-black-200]">
                    {formatDate(srv.started)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={
                        srv.status === "active"
                          ? "border-emerald-500 text-emerald-400"
                          : "border-[--color-dark-orange-400] text-[--color-dark-orange-400]"
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
        <div className="flex items-center justify-center rounded-xl border border-dashed border-[--color-black-700] py-16 text-sm text-[--color-black-400]">
          <div className="text-center">
            <Server className="mx-auto mb-2 h-8 w-8 text-[--color-black-600]" />
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
                        ? "border-emerald-500 text-emerald-400"
                        : "border-[--color-dark-orange-400] text-[--color-dark-orange-400]"
                    }
                  >
                    {selectedServer.status}
                  </Badge>
                </DetailRow>
                <DetailRow label="Started" value={formatDate(selectedServer.started)} />
                <DetailRow label="Strict Priority" value={selectedServer.strictPriority ? "Yes" : "No"} />
              </div>

              <Separator className="bg-[--color-black-800]" />

              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase text-[--color-black-400]">
                  Queues
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedServer.queues ?? []).map((q) => (
                    <Badge key={q} variant="secondary">{q}</Badge>
                  ))}
                </div>
              </div>

              <Separator className="bg-[--color-black-800]" />

              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase text-[--color-black-400]">
                  Active Workers ({selectedServer.activeWorkers?.length ?? 0})
                </span>
                {(selectedServer.activeWorkers?.length ?? 0) > 0 ? (
                  <div className="space-y-2">
                    {selectedServer.activeWorkers.map((w) => (
                      <div
                        key={w.taskID}
                        className="rounded-lg border border-[--color-black-800] bg-[--color-black-900]/40 p-3 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[--color-black-50]">{w.type}</span>
                          <Badge variant="secondary" className="text-[10px]">{w.queue}</Badge>
                        </div>
                        <div className="font-mono text-[10px] text-[--color-black-400] truncate">
                          {w.taskID}
                        </div>
                        <div className="text-[10px] text-[--color-black-400]">
                          Started: {formatDate(w.started)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[--color-black-400]">No active workers</p>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
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
