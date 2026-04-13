import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/environment/page-header";
import { useRedisInfo } from "@/hooks/use-redis-info";
import { Skeleton } from "@/components/ui/skeleton";
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
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Code,
  Database,
  TableProperties,
} from "lucide-react";

export const Route = createFileRoute("/environment/$id/redis")({
  component: RedisInfoPage,
});

function RedisInfoPage() {
  const { id } = Route.useParams();
  const environmentId = Number(id);
  const { data, isLoading, isError, error } = useRedisInfo(environmentId);
  const [showRaw, setShowRaw] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (name: string) => {
    setCollapsed((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="space-y-6">
          <PageHeader title="Redis" />
          <Skeleton className="h-64 rounded" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 space-y-4">
        <div className="space-y-6">
          <PageHeader title="Redis" />
          <div className="flex items-center gap-3 rounded border border-[--color-error]/30 bg-[--color-error]/10 p-4 text-sm text-[--color-error]">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              Failed to load Redis info.{" "}
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

  const sections = data?.sections ?? [];

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-6">
        <PageHeader
          title="Redis"
          description="Server information and statistics."
          actions={
            <div className="flex gap-2">
              <Button
                variant={showRaw ? "default" : "outline"}
                size="sm"
                onClick={() => setShowRaw(false)}
              >
                <TableProperties className="h-4 w-4" />
                Structured
              </Button>
              <Button
                variant={showRaw ? "outline" : "default"}
                size="sm"
                onClick={() => setShowRaw(true)}
              >
                <Code className="h-4 w-4" />
                Raw
              </Button>
            </div>
          }
        />

        {showRaw ? (
          <div className="rounded border border-[--color-divider] bg-[--color-primary-light]">
            <div className="flex items-center gap-2 border-b border-[--color-divider] px-4 py-3">
              <Code className="h-4 w-4 text-[--color-accent]" />
              <h2 className="text-sm font-semibold text-[--color-text-primary]">Raw Output</h2>
            </div>
            <pre className="max-h-[70vh] overflow-auto p-4 font-mono text-xs text-[--color-text-secondary] leading-relaxed">
              {data?.rawInfo}
            </pre>
          </div>
        ) : sections.length > 0 ? (
          <div className="space-y-3">
            {sections.map((section) => {
              const isCollapsed = collapsed[section.name];
              return (
                <div
                  key={section.name}
                  className="rounded border border-[--color-divider] bg-[--color-primary-light] overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(section.name)}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-[--color-hover] transition-colors cursor-pointer"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-[--color-text-secondary]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[--color-accent]" />
                    )}
                    <h2 className="text-sm font-semibold text-[--color-text-primary]">
                      {section.name}
                    </h2>
                    <span className="text-[10px] text-[--color-text-secondary]">
                      {section.entries?.length ?? 0} entries
                    </span>
                  </button>

                  {!isCollapsed && (section.entries?.length ?? 0) > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[--color-divider] hover:bg-transparent">
                          <TableHead className="text-[--color-text-secondary] w-1/3">Key</TableHead>
                          <TableHead className="text-[--color-text-secondary]">Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {section.entries.map((entry) => (
                          <TableRow
                            key={entry.key}
                            className="border-[--color-divider] hover:bg-[--color-hover] transition-colors"
                          >
                            <TableCell className="font-mono text-xs text-[--color-text-secondary]">
                              {entry.key}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-[--color-text-primary] break-all">
                              {entry.value}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded border border-dashed border-[--color-divider] py-16 text-sm text-[--color-text-secondary]">
            <div className="text-center">
              <Database className="mx-auto mb-2 h-8 w-8 text-[--color-text-muted]" />
              <p>No Redis info available.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
