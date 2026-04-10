import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/environment/page-header";

export const Route = createFileRoute("/environment/$id/queues")({
  component: QueuesPage,
});

function QueuesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Queues"
        description="Queue management and monitoring."
      />
      <div className="flex items-center justify-center rounded-xl border border-dashed border-[--color-black-700] py-24 text-sm text-[--color-black-400]">
        Queues content coming soon
      </div>
    </div>
  );
}
