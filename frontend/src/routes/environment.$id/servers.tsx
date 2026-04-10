import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/environment/page-header";

export const Route = createFileRoute("/environment/$id/servers")({
  component: ServersPage,
});

function ServersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Servers"
        description="Connected server instances and active workers."
      />
      <div className="flex items-center justify-center rounded-xl border border-dashed border-[--color-black-700] py-24 text-sm text-[--color-black-400]">
        Servers content coming soon
      </div>
    </div>
  );
}
