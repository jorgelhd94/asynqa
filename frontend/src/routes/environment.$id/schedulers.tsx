import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/environment/page-header";
import { StatCard } from "@/components/environment/stat-card";
import { useSchedulerEntries, useEnqueueEvents } from "@/hooks/use-schedulers";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { scheduler } from "../../../wailsjs/go/models";

export const Route = createFileRoute("/environment/$id/schedulers")({
  component: SchedulersPage,
});

const PAGE_SIZE = 20;

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

function tryFormatJSON(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}

function SchedulersPage() {
  const { id } = Route.useParams();
  const environmentId = Number(id);
  const { data, isLoading, isError, error } = useSchedulerEntries(environmentId);
  const [selectedEntry, setSelectedEntry] = useState<scheduler.SchedulerEntry | null>(null);
  const [eventsPage, setEventsPage] = useState(1);

  const events = useEnqueueEvents(
    environmentId,
    selectedEntry?.id ?? "",
    eventsPage,
    PAGE_SIZE,
    !!selectedEntry
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Schedulers" />
        <Skeleton className="h-24 w-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Schedulers" />
        <div className="flex items-center gap-3 rounded-xl border border-[--color-vibrant-coral-500]/30 bg-[--color-vibrant-coral-500]/10 p-4 text-sm text-[--color-vibrant-coral-400]">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Failed to load scheduler data.{" "}
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

  const entries = data?.entries ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedulers"
        description="Periodic task entries and execution history."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Scheduler Entries"
          value={entries.length}
          icon={CalendarClock}
          iconColor="text-[--color-velvet-orchid-400]"
        />
      </div>

      {entries.length > 0 ? (
        <div className="rounded-xl border border-[--color-black-800] bg-[--color-black-900]/60 backdrop-blur">
          <div className="flex items-center gap-2 border-b border-[--color-black-800] px-4 py-3">
            <Activity className="h-4 w-4 text-[--color-electric-rose-300]" />
            <h2 className="text-sm font-semibold text-[--color-black-50]">
              Scheduler Entries
            </h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-[--color-black-800] hover:bg-transparent">
                <TableHead className="text-[--color-black-400]">ID</TableHead>
                <TableHead className="text-[--color-black-400]">Schedule</TableHead>
                <TableHead className="text-[--color-black-400]">Task Type</TableHead>
                <TableHead className="text-[--color-black-400]">Next Enqueue</TableHead>
                <TableHead className="text-[--color-black-400]">Prev Enqueue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => (
                <TableRow
                  key={e.id}
                  className="border-[--color-black-800] hover:bg-[--color-black-800]/50 cursor-pointer"
                  onClick={() => { setSelectedEntry(e); setEventsPage(1); }}
                >
                  <TableCell className="font-mono text-xs text-[--color-black-200]">
                    {e.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {e.spec}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-[--color-black-50]">
                    {e.taskType}
                  </TableCell>
                  <TableCell className="text-xs text-[--color-black-200]">
                    {formatDate(e.nextEnqueueAt)}
                  </TableCell>
                  <TableCell className="text-xs text-[--color-black-200]">
                    {formatDate(e.prevEnqueueAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-[--color-black-700] py-16 text-sm text-[--color-black-400]">
          <div className="text-center">
            <CalendarClock className="mx-auto mb-2 h-8 w-8 text-[--color-black-600]" />
            <p>No scheduler entries found.</p>
            <p className="mt-1 text-xs">Register periodic tasks with asynq.Scheduler to see entries here.</p>
          </div>
        </div>
      )}

      <Sheet open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base">Scheduler Entry</SheetTitle>
          </SheetHeader>
          {selectedEntry && (
            <div className="space-y-5 pt-4">
              <div className="space-y-3">
                <DetailRow label="ID" value={selectedEntry.id} mono />
                <DetailRow label="Schedule" value={selectedEntry.spec} mono />
                <DetailRow label="Task Type" value={selectedEntry.taskType} />
                <DetailRow label="Next Enqueue" value={formatDate(selectedEntry.nextEnqueueAt)} />
                <DetailRow label="Prev Enqueue" value={formatDate(selectedEntry.prevEnqueueAt)} />
              </div>

              {selectedEntry.taskPayload && (
                <>
                  <Separator className="bg-[--color-black-800]" />
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase text-[--color-black-400]">
                      Payload
                    </span>
                    <pre className="max-h-48 overflow-auto rounded-lg border border-[--color-black-800] bg-[--color-black-900] p-3 text-xs text-[--color-black-200]">
                      {tryFormatJSON(selectedEntry.taskPayload)}
                    </pre>
                  </div>
                </>
              )}

              {(selectedEntry.options?.length ?? 0) > 0 && (
                <>
                  <Separator className="bg-[--color-black-800]" />
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase text-[--color-black-400]">
                      Options
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEntry.options.map((opt, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">{opt}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator className="bg-[--color-black-800]" />

              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase text-[--color-black-400]">
                  Enqueue History
                </span>
                {events.isLoading ? (
                  <Skeleton className="h-32 rounded-lg" />
                ) : (events.data?.events?.length ?? 0) > 0 ? (
                  <>
                    <div className="space-y-1.5">
                      {events.data!.events.map((ev, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg border border-[--color-black-800] bg-[--color-black-900]/40 px-3 py-2"
                        >
                          <span className="font-mono text-[10px] text-[--color-black-300] truncate">
                            {ev.taskID}
                          </span>
                          <span className="shrink-0 text-[10px] text-[--color-black-400] ml-3">
                            {formatDate(ev.enqueuedAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                    {events.data!.totalCount >= PAGE_SIZE && (
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-[--color-black-400]">Page {eventsPage}</span>
                        <div className="flex gap-1.5">
                          <Button
                            variant="outline"
                            size="icon-xs"
                            disabled={eventsPage <= 1}
                            onClick={() => setEventsPage(eventsPage - 1)}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon-xs"
                            disabled={events.data!.events.length < PAGE_SIZE}
                            onClick={() => setEventsPage(eventsPage + 1)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-[--color-black-400]">No enqueue events recorded yet.</p>
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
