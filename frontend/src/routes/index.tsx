import { AddEnvironmentButton } from "@/components/environments/add-button";
import { EnvironmentCard } from "@/components/environments/environment-card";
import { EnvironmentDialog } from "@/components/environments/environment-dialog";
import { EnvironmentsHeader } from "@/components/environments/header";
import { HeroSection } from "@/components/environments/hero-section";
import { EnvironmentInfo } from "@/components/environments/types";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { sileo } from "sileo";

const environments: EnvironmentInfo[] = [
  {
    id: "local",
    name: "Localhost",
    host: "127.0.0.1:6379",
  },
  {
    id: "prod",
    name: "Production - AWS",
    host: "redis-01.aws-east.internal:6380",
  },
  {
    id: "stg",
    name: "Staging - Cluster 1",
    host: "10.0.4.155:6379",
  },
];

export const Route = createFileRoute("/")({
  component: IndexPage,
});

export default function IndexPage() {
  const [open, setOpen] = useState(false);

  const openToast = () => {
    sileo.success({
      title: "Environment added successfully",
      description: "Environment added successfully",
    });
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
          {environments.map((env, idx) => (
            <EnvironmentCard key={env.id} env={env} highlighted={idx === 0} />
          ))}

          <Button onClick={openToast}>Open Toast</Button>

          <EnvironmentDialog
            trigger={<AddEnvironmentButton />}
            open={open}
            onOpenChange={setOpen}
          />
        </section>
      </div>
    </div>
  );
}
