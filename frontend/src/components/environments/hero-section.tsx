import Logo from '/appicon.svg';

function AppIcon({ className }: { className?: string }) {
  return (
    <img src={Logo} alt="AsynQA" className={className} />
  );
}

export function HeroSection() {
  return (
    <header className="flex flex-col items-center gap-4 text-center">
      <AppIcon className="h-16 w-16" />
      <div>
        <div className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">Asyn<span className="text-[var(--color-accent-val)]">QA</span></div>
        <div className="mt-1 text-sm uppercase tracking-[0.12em]">
          Golang Asynq Tool
        </div>
      </div>
    </header>
  );
}
