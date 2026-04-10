import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/environment/page-header";

export const Route = createFileRoute("/environment/$id/schedulers")({
  component: SchedulersPage,
});

function SchedulersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedulers"
        description="Periodic task entries and execution history."
      />
      <div className="flex items-center justify-center rounded-xl border border-dashed border-[--color-black-700] py-24 text-sm text-[--color-black-400]">
        Schedulers content coming soon
      </div>
    </div>
  );
}
