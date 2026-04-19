import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title: string;
  error?: Error | null;
  onRetry?: () => void;
  isRetrying?: boolean;
};

function parseErrorMessage(error: Error): string {
  try {
    const parsed = JSON.parse(error.message);
    if (parsed && typeof parsed.message === "string") return parsed.message;
  } catch {
    // not JSON, fall through to raw message
  }
  return error.message;
}

export function ErrorState({ title, error, onRetry, isRetrying }: ErrorStateProps) {
  const message = error ? parseErrorMessage(error) : undefined;

  return (
    <div className="flex items-center justify-center py-10">
      <div className="w-full max-w-md rounded border border-(--color-error)/30 bg-(--color-error)/10 p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-(--color-error)/20">
          <AlertTriangle className="h-5 w-5 text-(--color-error)" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-(--color-text-primary)">
          {title}
        </h3>
        {message && (
          <p className="mt-1 text-xs text-(--color-text-secondary) break-words">
            {message}
          </p>
        )}
        {onRetry && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
              />
              {isRetrying ? "Retrying..." : "Retry"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
