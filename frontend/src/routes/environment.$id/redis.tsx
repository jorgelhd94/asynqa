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
      <div className="space-y-6">
        <PageHeader title="Redis" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Redis" />
        <div className="flex items-center gap-3 rounded-xl border border-[--color-vibrant-coral-500]/30 bg-[--color-vibrant-coral-500]/10 p-4 text-sm text-[--color-vibrant-coral-400]">
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
    );
  }

  const sections = data?.sections ?? [];

  return (
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
        <div className="rounded-xl border border-[--color-black-800] bg-[--color-black-900]/60 backdrop-blur">
          <div className="flex items-center gap-2 border-b border-[--color-black-800] px-4 py-3">
            <Code className="h-4 w-4 text-[--color-electric-rose-300]" />
            <h2 className="text-sm font-semibold text-[--color-black-50]">Raw Output</h2>
          </div>
          <pre className="max-h-[70vh] overflow-auto p-4 font-mono text-xs text-[--color-black-200] leading-relaxed">
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
                className="rounded-xl border border-[--color-black-800] bg-[--color-black-900]/60 backdrop-blur overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.name)}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-[--color-black-800]/30 transition-colors cursor-pointer"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-[--color-black-400]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[--color-electric-rose-300]" />
                  )}
                  <h2 className="text-sm font-semibold text-[--color-black-50]">
                    {section.name}
                  </h2>
                  <span className="text-[10px] text-[--color-black-400]">
                    {section.entries?.length ?? 0} entries
                  </span>
                </button>

                {!isCollapsed && (section.entries?.length ?? 0) > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[--color-black-800] hover:bg-transparent">
                        <TableHead className="text-[--color-black-400] w-1/3">Key</TableHead>
                        <TableHead className="text-[--color-black-400]">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {section.entries.map((entry) => (
                        <TableRow
                          key={entry.key}
                          className="border-[--color-black-800] hover:bg-[--color-black-800]/50"
                        >
                          <TableCell className="font-mono text-xs text-[--color-black-300]">
                            {entry.key}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-[--color-black-50] break-all">
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
        <div className="flex items-center justify-center rounded-xl border border-dashed border-[--color-black-700] py-16 text-sm text-[--color-black-400]">
          <div className="text-center">
            <Database className="mx-auto mb-2 h-8 w-8 text-[--color-black-600]" />
            <p>No Redis info available.</p>
          </div>
        </div>
      )}
    </div>
  );
}
