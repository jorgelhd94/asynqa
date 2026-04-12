import { AddEnvironmentButton } from "@/components/environments/add-button";
import { EnvironmentCard } from "@/components/environments/environment-card";
import { EnvironmentDialog } from "@/components/environments/environment-dialog";
import { DeleteEnvironmentDialog } from "@/components/environments/delete-dialog";
import { EnvironmentsHeader } from "@/components/environments/header";
import { HeroSection } from "@/components/environments/hero-section";
import type { Environment } from "@/components/environments/types";
import {
  useEnvironments,
  useDeleteEnvironment,
  useTestConnection,
} from "@/hooks/use-environments";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { sileo } from "sileo";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

export default function IndexPage() {
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Environment | undefined>();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEnv, setDeletingEnv] = useState<Environment | undefined>();

  const [connectingId, setConnectingId] = useState<number | null>(null);

  const { data: environments = [], isLoading } = useEnvironments();
  const deleteMutation = useDeleteEnvironment();
  const testConnection = useTestConnection();

  const handleSelect = (env: Environment) => {
    if (connectingId !== null) return;
    setConnectingId(env.ID);
    testConnection.mutate(env, {
      onSuccess: () => {
        navigate({ to: "/environment/$id", params: { id: String(env.ID) } });
      },
      onError: (error) => {
        let description = error.message;
        try {
          const parsed = JSON.parse(description);
          description = parsed.message ?? description;
        } catch {
          // use raw message
        }
        sileo.error({
          title: "Connection failed",
          description,
        });
      },
      onSettled: () => {
        setConnectingId(null);
      },
    });
  };

  const handleEdit = (env: Environment) => {
    setEditingEnv(env);
    setDialogOpen(true);
  };

  const handleDeleteRequest = (env: Environment) => {
    setDeletingEnv(env);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = (env: Environment) => {
    deleteMutation.mutate(env.ID, {
      onSuccess: () => {
        sileo.success({ title: `"${env.Name}" deleted` });
        setDeleteDialogOpen(false);
        setDeletingEnv(undefined);
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

          {environments.map((env) => (
            <EnvironmentCard
              key={env.ID}
              env={env}
              connecting={connectingId === env.ID}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
          ))}

          <EnvironmentDialog
            trigger={<AddEnvironmentButton />}
            open={dialogOpen}
            onOpenChange={handleDialogChange}
            environment={editingEnv}
          />

          <DeleteEnvironmentDialog
            environment={deletingEnv}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={handleDeleteConfirm}
          />
        </section>
      </div>
    </div>
  );
}
