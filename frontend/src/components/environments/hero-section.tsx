import { CloudCog } from "lucide-react";

export function HeroSection() {
  return (
    <header className="flex flex-col items-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded border border-[--color-divider] bg-[--color-primary-light]">
        <CloudCog className="h-8 w-8 text-[--color-accent]" />
      </div>
      <div>
        <div className="text-3xl font-semibold tracking-tight text-[--color-text-primary]">AsynQA</div>
        <div className="mt-1 text-sm uppercase tracking-[0.12em] text-[--color-accent]">
          Golang Asynq Tool
        </div>
      </div>
    </header>
  );
}
