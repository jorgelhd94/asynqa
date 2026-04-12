import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/environment/page-header";

export const Route = createFileRoute("/environment/$id/workers")({
  component: WorkersPage,
});

function WorkersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Workers"
        description="Connected worker instances processing tasks."
      />
      <div className="flex items-center justify-center rounded-xl border border-dashed border-[--color-black-700] py-24 text-sm text-[--color-black-400]">
        Workers content coming soon
      </div>
    </div>
  );
}
