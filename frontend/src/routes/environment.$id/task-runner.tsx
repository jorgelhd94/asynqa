import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/environment/page-header";

export const Route = createFileRoute("/environment/$id/task-runner")({
  component: TaskRunnerPage,
});

function TaskRunnerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Runner"
        description="Execute tasks manually, like Postman for asynq."
      />
      <div className="flex items-center justify-center rounded-xl border border-dashed border-[--color-black-700] py-24 text-sm text-[--color-black-400]">
        Task Runner coming soon
      </div>
    </div>
  );
}
