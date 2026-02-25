import { AddEnvironmentButton } from "@/components/environments/add-button";
import { EnvironmentCard } from "@/components/environments/card";
import { EnvironmentsHeader } from "@/components/environments/header";
import { HeroSection } from "@/components/environments/hero-section";
import { EnvironmentInfo } from "@/components/environments/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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

export const Route = createFileRoute('/' as unknown as undefined)({
  component: IndexPage,
})

export default function IndexPage() {
  const [open, setOpen] = useState(false);

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

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <AddEnvironmentButton />
            </DialogTrigger>
            <DialogContent className="border-[--color-black-700] bg-[--color-black-900] text-[--color-black-50]">
              <DialogHeader>
                <DialogTitle>Nuevo environment</DialogTitle>
                <DialogDescription>
                  Define nombre y host. Este flujo es mock por ahora.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    className="text-sm text-[--color-black-200]"
                    htmlFor="env-name"
                  >
                    Nombre
                  </label>
                  <input
                    id="env-name"
                    className="w-full rounded-lg border border-[--color-black-700] bg-[--color-black-800] px-3 py-2 text-[--color-black-50] outline-none ring-1 ring-transparent transition focus:border-[--color-electric-rose-400] focus:ring-[--color-electric-rose-500]"
                    placeholder="p.ej. Production"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-sm text-[--color-black-200]"
                    htmlFor="env-host"
                  >
                    Host
                  </label>
                  <input
                    id="env-host"
                    className="w-full rounded-lg border border-[--color-black-700] bg-[--color-black-800] px-3 py-2 text-[--color-black-50] outline-none ring-1 ring-transparent transition focus:border-[--color-electric-rose-400] focus:ring-[--color-electric-rose-500]"
                    placeholder="p.ej. redis-01.aws-east.internal:6380"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="ghost"
                  className="text-[--color-black-200] hover:bg-[--color-black-800]"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button className="bg-[--color-electric-rose-500] text-[--color-black-50] hover:bg-[--color-electric-rose-400]">
                  Guardar (mock)
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>
      </div>
    </div>
  );
}
