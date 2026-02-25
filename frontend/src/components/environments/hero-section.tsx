import { CloudCog } from "lucide-react";

export function HeroSection() {
  return (
    <header className="flex flex-col items-center gap-4 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[--color-electric-rose-400]/35 bg-[--color-black-900]/70 shadow-[0_20px_70px_-28px_rgba(215,40,169,0.7)] backdrop-blur">
        <div
          className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(215,40,169,0.28),transparent_60%)]"
          aria-hidden
        />
        <CloudCog className="h-8 w-8 text-[--color-electric-rose-300]" />
      </div>
      <div>
        <div className="text-3xl font-semibold tracking-tight text-[--color-black-50]">AsynQA</div>
        <div className="mt-1 text-sm uppercase tracking-[0.12em] text-[--color-electric-rose-300]">
          Golang Asynq Tool
        </div>
      </div>
    </header>
  );
}
