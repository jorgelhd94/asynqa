import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/environment/page-header";
import { useEnqueueTask } from "@/hooks/use-task-runner";
import { useQueues } from "@/hooks/use-queues";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCcw,
} from "lucide-react";
import { taskrunner } from "../../../wailsjs/go/models";

export const Route = createFileRoute("/environment/$id/task-runner")({
  component: TaskRunnerPage,
});

function TaskRunnerPage() {
  const { id } = Route.useParams();
  const environmentId = Number(id);
  const { data: queuesData, isLoading: queuesLoading } = useQueues(environmentId);
  const enqueueMutation = useEnqueueTask(environmentId);

  const queueNames = (queuesData?.queues ?? []).map((q) => q.queue);

  const [queue, setQueue] = useState("");
  const [taskType, setTaskType] = useState("");
  const [payload, setPayload] = useState("{}");
  const [maxRetry, setMaxRetry] = useState("");
  const [timeoutSecs, setTimeoutSecs] = useState("");
  const [delaySecs, setDelaySecs] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskType.trim()) return;

    const request = new taskrunner.EnqueueRequest({
      queue: queue.trim() || "default",
      taskType: taskType.trim(),
      payload: payload.trim() || "{}",
      maxRetry: maxRetry ? parseInt(maxRetry, 10) : 0,
      timeoutSecs: timeoutSecs ? parseInt(timeoutSecs, 10) : 0,
      delaySecs: delaySecs ? parseInt(delaySecs, 10) : 0,
    });

    enqueueMutation.mutate(request);
  };

  const handleReset = () => {
    setQueue("");
    setTaskType("");
    setPayload("{}");
    setMaxRetry("");
    setTimeoutSecs("");
    setDelaySecs("");
    enqueueMutation.reset();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Runner"
        description="Enqueue tasks manually \u2014 like Postman for asynq."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request form */}
        <div className="rounded-xl border border-[--color-black-800] bg-[--color-black-900]/60 backdrop-blur">
          <div className="flex items-center justify-between border-b border-[--color-black-800] px-4 py-3">
            <h2 className="text-sm font-semibold text-[--color-black-50]">Request</h2>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleReset}
              className="text-[--color-black-400] hover:text-[--color-black-50]"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[--color-black-300]">Queue</label>
              {queuesLoading ? (
                <Skeleton className="h-8 rounded-md" />
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={queue}
                    onChange={(e) => setQueue(e.target.value)}
                    placeholder="default"
                    className="h-8 flex-1 rounded-md border border-[--color-black-700] bg-[--color-black-900] px-3 text-xs text-[--color-black-50] placeholder:text-[--color-black-500] outline-none focus:border-[--color-electric-rose-400]"
                    list="queue-list"
                  />
                  <datalist id="queue-list">
                    {queueNames.map((q) => (
                      <option key={q} value={q} />
                    ))}
                  </datalist>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[--color-black-300]">
                Task Type <span className="text-[--color-vibrant-coral-400]">*</span>
              </label>
              <input
                type="text"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                placeholder="e.g. email:send"
                required
                className="h-8 w-full rounded-md border border-[--color-black-700] bg-[--color-black-900] px-3 text-xs text-[--color-black-50] placeholder:text-[--color-black-500] outline-none focus:border-[--color-electric-rose-400]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[--color-black-300]">Payload (JSON)</label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={6}
                className="w-full rounded-md border border-[--color-black-700] bg-[--color-black-900] p-3 font-mono text-xs text-[--color-black-50] placeholder:text-[--color-black-500] outline-none focus:border-[--color-electric-rose-400] resize-y"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[--color-black-300]">Max Retry</label>
                <input
                  type="number"
                  min="0"
                  value={maxRetry}
                  onChange={(e) => setMaxRetry(e.target.value)}
                  placeholder="0"
                  className="h-8 w-full rounded-md border border-[--color-black-700] bg-[--color-black-900] px-3 text-xs text-[--color-black-50] placeholder:text-[--color-black-500] outline-none focus:border-[--color-electric-rose-400]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[--color-black-300]">Timeout (s)</label>
                <input
                  type="number"
                  min="0"
                  value={timeoutSecs}
                  onChange={(e) => setTimeoutSecs(e.target.value)}
                  placeholder="0"
                  className="h-8 w-full rounded-md border border-[--color-black-700] bg-[--color-black-900] px-3 text-xs text-[--color-black-50] placeholder:text-[--color-black-500] outline-none focus:border-[--color-electric-rose-400]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[--color-black-300]">Delay (s)</label>
                <input
                  type="number"
                  min="0"
                  value={delaySecs}
                  onChange={(e) => setDelaySecs(e.target.value)}
                  placeholder="0"
                  className="h-8 w-full rounded-md border border-[--color-black-700] bg-[--color-black-900] px-3 text-xs text-[--color-black-50] placeholder:text-[--color-black-500] outline-none focus:border-[--color-electric-rose-400]"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={!taskType.trim() || enqueueMutation.isPending}
              className="w-full bg-[--color-electric-rose-500] hover:bg-[--color-electric-rose-600] text-white font-semibold"
            >
              <Play className="h-4 w-4" />
              {enqueueMutation.isPending ? "Enqueuing..." : "Enqueue Task"}
            </Button>
          </form>
        </div>

        {/* Response panel */}
        <div className="rounded-xl border border-[--color-black-800] bg-[--color-black-900]/60 backdrop-blur">
          <div className="flex items-center gap-2 border-b border-[--color-black-800] px-4 py-3">
            <h2 className="text-sm font-semibold text-[--color-black-50]">Response</h2>
            {enqueueMutation.isSuccess && (
              <Badge variant="outline" className="border-emerald-500 text-emerald-400 text-[10px]">
                Success
              </Badge>
            )}
            {enqueueMutation.isError && (
              <Badge variant="outline" className="border-[--color-vibrant-coral-500] text-[--color-vibrant-coral-400] text-[10px]">
                Error
              </Badge>
            )}
          </div>

          <div className="p-4">
            {enqueueMutation.isIdle && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-[--color-black-400]">
                <Play className="mb-3 h-8 w-8 text-[--color-black-600]" />
                <p className="text-sm">Send a request to see the response</p>
                <p className="mt-1 text-xs">Fill in the form and click Enqueue Task</p>
              </div>
            )}

            {enqueueMutation.isPending && (
              <div className="flex items-center justify-center py-12">
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            )}

            {enqueueMutation.isSuccess && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="text-sm text-emerald-400">Task enqueued successfully</span>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase text-[--color-black-400]">
                    Task ID
                  </span>
                  <pre className="rounded-lg border border-[--color-black-800] bg-[--color-black-900] p-3 font-mono text-xs text-[--color-electric-rose-300]">
                    {enqueueMutation.data.taskID}
                  </pre>
                </div>
              </div>
            )}

            {enqueueMutation.isError && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-lg border border-[--color-vibrant-coral-500]/20 bg-[--color-vibrant-coral-500]/5 p-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-[--color-vibrant-coral-400]" />
                  <span className="text-sm text-[--color-vibrant-coral-400]">Failed to enqueue task</span>
                </div>
                <pre className="rounded-lg border border-[--color-black-800] bg-[--color-black-900] p-3 text-xs text-[--color-vibrant-coral-400]">
                  {enqueueMutation.error?.message}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
