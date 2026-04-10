import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/environment/page-header";

export const Route = createFileRoute("/environment/$id/tasks")({
  component: TasksPage,
});

function TasksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Browse and manage tasks by state."
      />
      <div className="flex items-center justify-center rounded-xl border border-dashed border-[--color-black-700] py-24 text-sm text-[--color-black-400]">
        Tasks content coming soon
      </div>
    </div>
  );
}
