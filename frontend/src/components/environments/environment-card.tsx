import { Database, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Environment } from "./types";

export type EnvironmentCardProps = {
  env: Environment;
  connecting?: boolean;
  onSelect: (env: Environment) => void;
  onEdit: (env: Environment) => void;
  onDelete: (env: Environment) => void;
};

export function EnvironmentCard({
  env,
  connecting,
  onSelect,
  onEdit,
  onDelete,
}: EnvironmentCardProps) {
  return (
    <div
      role="button"
      tabIndex={connecting ? -1 : 0}
      aria-disabled={connecting}
      className={`group relative overflow-hidden border border-[--color-divider] bg-[--color-primary-light] p-4 transition-all ${connecting ? "pointer-events-none opacity-70" : "cursor-pointer hover:border-[--color-accent-val] hover:bg-[--color-accent-glow]"} focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--color-accent-val]`}
      onClick={() => !connecting && onSelect(env)}
      onKeyDown={(e) => {
        if (!connecting && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(env);
        }
      }}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 h-full w-0.5 bg-[--color-divider] transition-colors group-hover:bg-[--color-accent-val]" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center bg-[--color-primary-dark] transition-colors group-hover:bg-[--color-accent-subtle]">
            {connecting ? (
              <Loader2 className="h-5 w-5 animate-spin text-[--color-accent]" />
            ) : (
              <Database className="h-5 w-5 text-[--color-text-muted] transition-colors group-hover:text-[--color-accent]" />
            )}
          </div>
          <div>
            <div className="text-base font-semibold leading-tight text-[--color-text-primary]">
              {env.Name}
            </div>
            <div className="text-xs text-[--color-text-muted] transition-colors group-hover:text-[--color-text-secondary]">
              {connecting ? "Connecting..." : env.Host}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${env.Name}`}
            className="text-[--color-text-muted] hover:bg-[--color-primary-dark] hover:text-[--color-accent] focus-visible:ring-[--color-accent-val]"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(env);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${env.Name}`}
            className="text-[--color-text-muted] hover:bg-[--color-error]/10 hover:text-[--color-error] focus-visible:ring-[--color-error]"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(env);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
