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
      className={`group relative overflow-hidden rounded-2xl border border-[--color-black-800] bg-[--color-black-900]/80 p-4 shadow-[0_12px_50px_-26px_rgba(0,0,0,0.65)] backdrop-blur transition ${connecting ? "pointer-events-none opacity-70" : "cursor-pointer hover:-translate-y-0.5 hover:border-[--color-electric-rose-400]/50 hover:bg-[--color-black-800]/70"} focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--color-electric-rose-400]`}
      onClick={() => !connecting && onSelect(env)}
      onKeyDown={(e) => {
        if (!connecting && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(env);
        }
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[--color-black-800] transition group-hover:bg-[--color-electric-rose-500]/15">
            {connecting ? (
              <Loader2 className="h-5 w-5 animate-spin text-[--color-electric-rose-300]" />
            ) : (
              <Database className="h-5 w-5 text-[--color-electric-rose-300]" />
            )}
          </div>
          <div>
            <div className="text-base font-semibold leading-tight text-[--color-black-50]">
              {env.Name}
            </div>
            <div className="text-xs text-[--color-black-300]">
              {connecting ? "Connecting..." : env.Host}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${env.Name}`}
            className="cursor-pointer text-[--color-black-400] hover:bg-[--color-black-700] hover:text-[--color-electric-rose-300] focus-visible:ring-[--color-electric-rose-400]"
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
            className="cursor-pointer text-[--color-black-400] hover:bg-[--color-vibrant-coral-500]/15 hover:text-[--color-vibrant-coral-400] focus-visible:ring-[--color-vibrant-coral-400]"
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
