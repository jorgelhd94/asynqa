import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/environment/page-header";
import { RefreshIndicator } from "@/components/environment/refresh-indicator";
import { StatCard } from "@/components/environment/stat-card";
import { useSchedulerEntries, useEnqueueEvents, useRunSchedulerEntry } from "@/hooks/use-schedulers";
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
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Play,
} from "lucide-react";
import { useClipboard } from "@/hooks/use-clipboard";
import { sileo } from "sileo";
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
  const { data, isLoading, isError, error, dataUpdatedAt, isFetching, refetch } = useSchedulerEntries(environmentId);
  const runEntryMutation = useRunSchedulerEntry(environmentId);
  const [selectedEntry, setSelectedEntry] = useState<scheduler.SchedulerEntry | null>(null);
  const [eventsPage, setEventsPage] = useState(1);
  const { copy: copyPayload, copied: payloadCopied } = useClipboard();

  const events = useEnqueueEvents(
    environmentId,
    selectedEntry?.id ?? "",
    eventsPage,
    PAGE_SIZE,
    !!selectedEntry
  );

  const handleRunNow = (entry: scheduler.SchedulerEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    runEntryMutation.mutate(entry.id, {
      onSuccess: (result) => {
        sileo.success({
          title: `Task "${entry.taskType}" enqueued`,
          description: `Queue: ${result.queue} \u00b7 ID: ${result.taskID}`,
        });
      },
      onError: (err) => {
        sileo.error({ title: `Failed to enqueue: ${err.message}` });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="space-y-6">
          <PageHeader title="Schedulers" />
          <Skeleton className="h-24 w-48 rounded" />
          <Skeleton className="h-64 rounded" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 space-y-4">
        <div className="space-y-6">
          <PageHeader title="Schedulers" />
          <div className="flex items-center gap-3 rounded border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-4 text-sm text-[var(--color-error)]">
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
      </div>
    );
  }

  const entries = data?.entries ?? [];

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-6">
        <PageHeader
          title="Schedulers"
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
            title="Scheduler Entries"
            value={entries.length}
            icon={CalendarClock}
            iconColor="text-[var(--color-accent-val)]"
          />
        </div>

        {entries.length > 0 ? (
          <div className="rounded border border-[var(--color-divider)] bg-[var(--color-primary-light)]">
            <div className="flex items-center gap-2 border-b border-[var(--color-divider)] px-4 py-3">
              <Activity className="h-4 w-4 text-[var(--color-accent-val)]" />
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Scheduler Entries
              </h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--color-divider)] hover:bg-transparent">
                  <TableHead className="text-[var(--color-text-secondary)]">ID</TableHead>
                  <TableHead className="text-[var(--color-text-secondary)]">Schedule</TableHead>
                  <TableHead className="text-[var(--color-text-secondary)]">Task Type</TableHead>
                  <TableHead className="text-[var(--color-text-secondary)]">Next Enqueue</TableHead>
                  <TableHead className="text-[var(--color-text-secondary)]">Prev Enqueue</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="border-[var(--color-divider)] hover:bg-[var(--color-row-hover)] cursor-pointer transition-colors"
                    onClick={() => { setSelectedEntry(entry); setEventsPage(1); }}
                  >
                    <TableCell className="font-mono text-xs text-[var(--color-text-secondary)]">
                      {entry.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {entry.spec}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-[var(--color-text-primary)]">
                      {entry.taskType}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--color-text-secondary)]">
                      {formatDate(entry.nextEnqueueAt)}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--color-text-secondary)]">
                      {formatDate(entry.prevEnqueueAt)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="xs"
                        disabled={runEntryMutation.isPending}
                        onClick={(e) => handleRunNow(entry, e)}
                        className="gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Run Now
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded border border-dashed border-[var(--color-divider)] py-16 text-sm text-[var(--color-text-secondary)]">
            <div className="text-center">
              <CalendarClock className="mx-auto mb-2 h-8 w-8 text-[var(--color-text-muted)]" />
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

                <Separator className="bg-[var(--color-divider)]" />

                <Button
                  variant="outline"
                  size="sm"
                  disabled={runEntryMutation.isPending}
                  onClick={() => handleRunNow(selectedEntry)}
                  className="w-full gap-2"
                >
                  <Play className="h-4 w-4" />
                  {runEntryMutation.isPending ? "Enqueuing..." : "Run Now"}
                </Button>

                {selectedEntry.taskPayload && (
                  <>
                    <Separator className="bg-[var(--color-divider)]" />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                          Payload
                        </span>
                        <button
                          onClick={() => copyPayload(tryFormatJSON(selectedEntry.taskPayload))}
                          className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                        >
                          {payloadCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {payloadCopied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <pre className="max-h-48 overflow-auto rounded-lg border border-[var(--color-divider)] bg-[var(--color-primary-bg)] p-3 text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap break-words">
                        {tryFormatJSON(selectedEntry.taskPayload)}
                      </pre>
                    </div>
                  </>
                )}

                {(selectedEntry.options?.length ?? 0) > 0 && (
                  <>
                    <Separator className="bg-[var(--color-divider)]" />
                    <div className="space-y-2">
                      <span className="text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                        Options
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEntry.options.map((opt, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{opt}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator className="bg-[var(--color-divider)]" />

                <div className="space-y-3">
                  <span className="text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
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
                            className="flex items-center justify-between rounded-lg border border-[var(--color-divider)] bg-[var(--color-primary-bg)] px-3 py-2"
                          >
                            <span className="font-mono text-xs text-[var(--color-text-secondary)] truncate">
                              {ev.taskID}
                            </span>
                            <span className="shrink-0 text-xs text-[var(--color-text-secondary)] ml-3">
                              {formatDate(ev.enqueuedAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                      {events.data!.totalCount >= PAGE_SIZE && (
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-[var(--color-text-secondary)]">Page {eventsPage}</span>
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
                    <p className="text-xs text-[var(--color-text-secondary)]">No enqueue events recorded yet.</p>
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
}: {
  label: string;
  value?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">{label}</span>
      <span className={`truncate text-right text-xs text-[var(--color-text-secondary)] ${mono ? "font-mono" : ""}`}>
        {value || "\u2014"}
      </span>
    </div>
  );
}
