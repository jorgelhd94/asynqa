import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useEnqueueTask } from "@/hooks/use-task-runner";
import { useQueues } from "@/hooks/use-queues";
import { useClipboard } from "@/hooks/use-clipboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  RefreshCw,
  RotateCcw,
  Send,
  Settings2,
  Zap,
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
  const { copy: copyTaskId, copied: taskIdCopied } = useClipboard();

  const queueNames = (queuesData?.queues ?? []).map((q) => q.queue);

  const [queue, setQueue] = useState("default");
  const [taskType, setTaskType] = useState("");
  const [payload, setPayload] = useState("{\n  \n}");
  const [maxRetry, setMaxRetry] = useState("");
  const [timeoutSecs, setTimeoutSecs] = useState("");
  const [delaySecs, setDelaySecs] = useState("");
  const [activeTab, setActiveTab] = useState("body");

  const handleSubmit = () => {
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
    setQueue("default");
    setTaskType("");
    setPayload("{\n  \n}");
    setMaxRetry("");
    setTimeoutSecs("");
    setDelaySecs("");
    enqueueMutation.reset();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopyTaskId = () => {
    if (enqueueMutation.data?.taskID) {
      copyTaskId(enqueueMutation.data.taskID);
    }
  };

  return (
    <div data-full-bleed className="flex h-full flex-col" onKeyDown={handleKeyDown}>
      {/* Top bar - Queue + Task Type + Send */}
      <div className="flex items-center gap-0 border-b border-[--color-divider] bg-[--color-primary-bg]">
        {/* Queue selector */}
        <div className="flex items-center border-r border-[--color-divider]">
          {queuesLoading ? (
            <Skeleton className="m-2 h-8 w-28 rounded-md" />
          ) : (
            <select
              value={queue}
              onChange={(e) => setQueue(e.target.value)}
              className="h-11 border-none bg-transparent px-4 text-xs font-semibold text-[var(--color-accent-light)] outline-none cursor-pointer"
            >
              <option value="default">default</option>
              {queueNames
                .filter((q) => q !== "default")
                .map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
            </select>
          )}
        </div>

        {/* Task type input */}
        <div className="flex flex-1 items-center">
          <input
            type="text"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            placeholder="Enter task type... e.g. email:send, user:sync"
            className="h-11 flex-1 border-none bg-transparent px-4 text-sm text-[--color-text-primary] placeholder:text-[--color-text-muted] outline-none"
          />
        </div>

        {/* Send button */}
        <div className="flex items-center gap-2 px-3">
          <Button
            onClick={handleSubmit}
            disabled={!taskType.trim() || enqueueMutation.isPending}
            className="bg-[var(--color-accent-val)] hover:bg-[var(--color-accent-dark)] text-white font-semibold gap-2 px-5"
            size="sm"
          >
            <Send className="h-3.5 w-3.5" />
            {enqueueMutation.isPending ? "Sending..." : "Send"}
          </Button>
          <span className="hidden text-[10px] text-[--color-text-muted] lg:block">Ctrl+Enter</span>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Editor */}
        <div className="flex flex-1 flex-col border-r border-[--color-divider]">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
            <div className="border-b border-[--color-divider]">
              <TabsList className="h-auto bg-transparent p-0 px-2">
                <TabsTrigger
                  value="body"
                  className="gap-1.5 rounded-none border-b-2 border-transparent px-3 py-2 text-xs data-[state=active]:border-[var(--color-accent-val)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-accent-val)]"
                >
                  <Zap className="h-3 w-3" />
                  Body
                </TabsTrigger>
                <TabsTrigger
                  value="options"
                  className="gap-1.5 rounded-none border-b-2 border-transparent px-3 py-2 text-xs data-[state=active]:border-[var(--color-accent-val)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--color-accent-val)]"
                >
                  <Settings2 className="h-3 w-3" />
                  Options
                  {(maxRetry || timeoutSecs || delaySecs) && (
                    <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-accent-val)]/20 text-[9px] text-[var(--color-accent-val)]">
                      {[maxRetry, timeoutSecs, delaySecs].filter(Boolean).length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="body" className="mt-0 flex-1 overflow-hidden">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[--color-divider]/50 px-4 py-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[--color-text-muted]">
                    JSON Payload
                  </span>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={handleReset}
                    className="h-6 text-[10px] text-[--color-text-secondary] hover:text-[--color-text-primary]"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    Clear
                  </Button>
                </div>
                <div className="relative flex-1">
                  {/* Line numbers gutter */}
                  <div className="absolute inset-y-0 left-0 flex w-10 flex-col border-r border-[--color-divider]/50 bg-[--color-primary-contrast]/50 pt-3 text-right">
                    {payload.split("\n").map((_, i) => (
                      <span
                        key={i}
                        className="px-2 font-mono text-[10px] leading-[20px] text-[--color-text-muted]"
                      >
                        {i + 1}
                      </span>
                    ))}
                  </div>
                  <textarea
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    spellCheck={false}
                    className="h-full w-full resize-none border-none bg-transparent p-3 pl-14 font-mono text-xs leading-[20px] text-[--color-text-primary] outline-none"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="options" className="mt-0 flex-1 p-4">
              <div className="space-y-5">
                <p className="text-xs text-[--color-text-secondary]">
                  Configure task processing options. Leave empty for defaults.
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-[--color-text-secondary]">
                      <RefreshCw className="h-3 w-3 text-[--color-text-muted]" />
                      Max Retry
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={maxRetry}
                      onChange={(e) => setMaxRetry(e.target.value)}
                      placeholder="Default (25)"
                      className="h-9 w-full rounded-lg border border-[--color-divider] bg-[--color-primary-bg] px-3 text-xs text-[--color-text-primary] placeholder:text-[--color-text-muted] outline-none focus:border-[var(--color-accent-val)] transition-colors"
                    />
                    <span className="text-[10px] text-[--color-text-muted]">
                      Times to retry on failure
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-[--color-text-secondary]">
                      <Clock className="h-3 w-3 text-[--color-text-muted]" />
                      Timeout (seconds)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={timeoutSecs}
                      onChange={(e) => setTimeoutSecs(e.target.value)}
                      placeholder="Default (1800)"
                      className="h-9 w-full rounded-lg border border-[--color-divider] bg-[--color-primary-bg] px-3 text-xs text-[--color-text-primary] placeholder:text-[--color-text-muted] outline-none focus:border-[var(--color-accent-val)] transition-colors"
                    />
                    <span className="text-[10px] text-[--color-text-muted]">
                      Max processing time
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-[--color-text-secondary]">
                      <Zap className="h-3 w-3 text-[--color-text-muted]" />
                      Delay (seconds)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={delaySecs}
                      onChange={(e) => setDelaySecs(e.target.value)}
                      placeholder="0 (immediate)"
                      className="h-9 w-full rounded-lg border border-[--color-divider] bg-[--color-primary-bg] px-3 text-xs text-[--color-text-primary] placeholder:text-[--color-text-muted] outline-none focus:border-[var(--color-accent-val)] transition-colors"
                    />
                    <span className="text-[10px] text-[--color-text-muted]">
                      Seconds before processing
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right panel - Response */}
        <div className="flex w-full flex-col lg:w-[400px]">
          <div className="flex items-center gap-2 border-b border-[--color-divider] px-4 py-2">
            <span className="text-xs font-semibold text-[--color-text-primary]">Response</span>
            {enqueueMutation.isSuccess && (
              <Badge variant="outline" className="border-[--color-success] text-[--color-success] text-[10px]">
                200 OK
              </Badge>
            )}
            {enqueueMutation.isError && (
              <Badge variant="outline" className="border-[--color-error] text-[--color-error] text-[10px]">
                Error
              </Badge>
            )}
          </div>

          <div className="flex flex-1 flex-col">
            {enqueueMutation.isIdle && (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[--color-primary-light]">
                  <Send className="h-7 w-7 text-[--color-text-muted]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[--color-text-secondary]">Send Request</p>
                  <p className="mt-1 text-xs text-[--color-text-muted]">
                    Enter a task type and click Send
                  </p>
                </div>
                <div className="space-y-1.5 pt-2">
                  <Shortcut label="Send Request" keys="Ctrl + Enter" />
                </div>
              </div>
            )}

            {enqueueMutation.isPending && (
              <div className="flex flex-1 items-center justify-center p-8">
                <div className="space-y-3 text-center">
                  <div className="mx-auto flex h-10 w-10 animate-pulse items-center justify-center rounded bg-[var(--color-accent-val)]/10">
                    <Send className="h-5 w-5 text-[var(--color-accent-val)]" />
                  </div>
                  <p className="text-xs text-[--color-text-secondary]">Enqueuing task...</p>
                </div>
              </div>
            )}

            {enqueueMutation.isSuccess && (
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-2 rounded-lg border border-[var(--color-accent-val)]/20 bg-[var(--color-accent-val)]/5 p-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[--color-success]" />
                  <span className="text-xs font-medium text-[--color-success]">Task enqueued successfully</span>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-[--color-text-muted]">
                      Task ID
                    </span>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={handleCopyTaskId}
                      className={`h-5 text-[10px] transition-colors ${taskIdCopied ? "text-[var(--color-accent-light)]" : "text-[--color-text-secondary] hover:text-[--color-text-primary]"}`}
                    >
                      {taskIdCopied ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                      {taskIdCopied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <pre className="rounded-lg border border-[--color-divider] bg-[--color-primary-contrast] p-3 font-mono text-xs text-[var(--color-accent-val)] select-all">
                    {enqueueMutation.data.taskID}
                  </pre>
                </div>

                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[--color-text-muted]">
                    Details
                  </span>
                  <pre className="rounded-lg border border-[--color-divider] bg-[--color-primary-contrast] p-3 font-mono text-[10px] leading-relaxed text-[--color-text-secondary]">
{JSON.stringify(
  {
    taskID: enqueueMutation.data.taskID,
    queue: queue.trim() || "default",
    type: taskType.trim(),
    status: "enqueued",
  },
  null,
  2
)}
                  </pre>
                </div>
              </div>
            )}

            {enqueueMutation.isError && (
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-2 rounded-lg border border-[--color-error]/20 bg-[--color-error]/5 p-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-[--color-error]" />
                  <span className="text-xs font-medium text-[--color-error]">
                    Failed to enqueue task
                  </span>
                </div>

                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[--color-text-muted]">
                    Error
                  </span>
                  <pre className="rounded-lg border border-[--color-divider] bg-[--color-primary-contrast] p-3 font-mono text-xs text-[--color-error] whitespace-pre-wrap">
                    {enqueueMutation.error?.message}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Shortcut({ label, keys }: { label: string; keys: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[--color-text-muted]">
      <span className="text-[10px]">{label}</span>
      <kbd className="rounded border border-[--color-divider] bg-[--color-primary-light] px-1.5 py-0.5 font-mono text-[9px] text-[--color-text-secondary]">
        {keys}
      </kbd>
    </div>
  );
}
