import { AddEnvironmentButton } from "@/components/environments/add-button";
import { EnvironmentCard } from "@/components/environments/environment-card";
import { EnvironmentDialog } from "@/components/environments/environment-dialog";
import { EnvironmentsHeader } from "@/components/environments/header";
import { HeroSection } from "@/components/environments/hero-section";
import type { Environment } from "@/components/environments/types";
import {
  useEnvironments,
  useDeleteEnvironment,
} from "@/hooks/use-environments";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { sileo } from "sileo";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

export default function IndexPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Environment | undefined>();

  const { data: environments = [], isLoading } = useEnvironments();
  const deleteMutation = useDeleteEnvironment();

  const handleEdit = (env: Environment) => {
    setEditingEnv(env);
    setDialogOpen(true);
  };

  const handleDelete = (env: Environment) => {
    deleteMutation.mutate(env.ID, {
      onSuccess: () => {
        sileo.success({ title: `"${env.Name}" deleted` });
      },
    });
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingEnv(undefined);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-[--color-black-950] text-[--color-black-50]"
      style={{
        background:
          "radial-gradient(circle at 15% 20%, rgba(215,40,169,0.08), transparent 32%), radial-gradient(circle at 80% 0%, rgba(153,73,182,0.12), transparent 30%), linear-gradient(145deg, #161320, #100d16 55%, #0d0a15)",
      }}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-14">
        <HeroSection />

        <section className="mt-14 flex w-full max-w-md flex-col gap-4">
          <EnvironmentsHeader total={environments.length} />

          {isLoading && (
            <div className="py-8 text-center text-sm text-[--color-black-400]">
              Loading environments...
            </div>
          )}

          {!isLoading && environments.length === 0 && (
            <div className="py-8 text-center text-sm text-[--color-black-400]">
              No saved environments. Create one to get started.
            </div>
          )}

          {environments.map((env, idx) => (
            <EnvironmentCard
              key={env.ID}
              env={env}
              highlighted={idx === 0}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

          <EnvironmentDialog
            trigger={<AddEnvironmentButton />}
            open={dialogOpen}
            onOpenChange={handleDialogChange}
            environment={editingEnv}
          />
        </section>
      </div>
    </div>
  );
}
