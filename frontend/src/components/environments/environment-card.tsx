import { Database, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type EnvironmentInfo = {
  id: string;
  name: string;
  host: string;
  accent?: "emerald" | "gray";
};

type EnvironmentCardProps = {
  env: EnvironmentInfo;
  highlighted?: boolean;
};

export function EnvironmentCard({ env, highlighted }: EnvironmentCardProps) {
  return (
    <div
      className={cn(
        "relative cursor-pointer overflow-hidden rounded-2xl border border-[--color-black-800] bg-[--color-black-900]/80 p-4 shadow-[0_12px_50px_-26px_rgba(0,0,0,0.65)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[--color-electric-rose-400]/50 hover:bg-[--color-black-800]/70",
        highlighted && "ring-1 ring-[--color-electric-rose-400]/60"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[--color-black-800]">
            <Database className="h-5 w-5 text-[--color-electric-rose-300]" />
          </div>
          <div>
            <div className="text-base font-semibold leading-tight text-[--color-black-50]">{env.name}</div>
            <div className="text-xs text-[--color-black-300]">{env.host}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[--color-black-300]">
          <button
            type="button"
            aria-label={`Editar ${env.name}`}
            className="cursor-pointer rounded-md p-1 transition hover:bg-[--color-black-800] hover:text-[--color-electric-rose-300]"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`Eliminar ${env.name}`}
            className="cursor-pointer rounded-md p-1 transition hover:bg-[--color-black-800]"
          >
            <Trash2 className="h-4 w-4 text-[--color-vibrant-coral-400]" />
          </button>
        </div>
      </div>
    </div>
  );
}
