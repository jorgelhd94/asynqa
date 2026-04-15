import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

type RefreshIndicatorProps = {
  intervalMs: number;
  dataUpdatedAt: number;
  onRefresh: () => void;
  isFetching: boolean;
};

export function RefreshIndicator({
  intervalMs,
  dataUpdatedAt,
  onRefresh,
  isFetching,
}: RefreshIndicatorProps) {
  const [remaining, setRemaining] = useState(intervalMs);

  useEffect(() => {
    if (!dataUpdatedAt) return;

    const tick = () => {
      const elapsed = Date.now() - dataUpdatedAt;
      const left = Math.max(0, intervalMs - elapsed);
      setRemaining(left);
    };

    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [dataUpdatedAt, intervalMs]);

  const seconds = Math.ceil(remaining / 1000);
  const progress = 1 - remaining / intervalMs;

  return (
    <button
      onClick={onRefresh}
      disabled={isFetching}
      className="flex items-center gap-2 rounded border border-(--color-divider) px-2.5 py-1 text-xs text-(--color-text-muted) hover:text-(--color-text-primary) hover:border-(--color-accent-val) transition-colors"
      title="Click to refresh now"
    >
      {isFetching ? (
        <RefreshCw className="h-4 w-4 animate-spin text-(--color-accent-val)" />
      ) : (
        <svg className="h-4 w-4 -rotate-90" viewBox="0 0 20 20">
          <circle
            cx="10" cy="10" r="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.15"
          />
          <circle
            cx="10" cy="10" r="8"
            fill="none"
            stroke="var(--color-accent-val)"
            strokeWidth="2"
            strokeDasharray={`${progress * 50.3} 50.3`}
            strokeLinecap="round"
          />
        </svg>
      )}
      {!isFetching && <span>{seconds}s</span>}
    </button>
  );
}
