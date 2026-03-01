import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import React from "react";

type EnvironmentDialogProps = {
  trigger: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EnvironmentDialog({ trigger, open, onOpenChange }: EnvironmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg border-[--color-black-800] text-[--color-black-50] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg font-semibold text-[--color-black-50]">Nueva conexión Redis</DialogTitle>
          <DialogDescription className="text-[--color-black-300]">
            Define los datos de la conexión. Podrás probarla antes de guardar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="env-name" className="text-sm text-[--color-black-200]">Nombre</Label>
            <Input
              id="env-name"
              placeholder="p.ej. Producción"
              className="border-[--color-black-700] bg-[--color-black-800] text-[--color-black-50] placeholder:text-[--color-black-500] focus:border-[--color-electric-rose-400] focus:ring-[--color-electric-rose-500]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="env-host" className="text-sm text-[--color-black-200]">Host</Label>
            <Input
              id="env-host"
              placeholder="p.ej. 127.0.0.1:6379"
              className="border-[--color-black-700] bg-[--color-black-800] text-[--color-black-50] placeholder:text-[--color-black-500] focus:border-[--color-electric-rose-400] focus:ring-[--color-electric-rose-500]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="env-password" className="text-sm text-[--color-black-200]">Password</Label>
              <Input
                id="env-password"
                type="password"
                placeholder="Opcional"
                className="border-[--color-black-700] bg-[--color-black-800] text-[--color-black-50] placeholder:text-[--color-black-500] focus:border-[--color-electric-rose-400] focus:ring-[--color-electric-rose-500]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="env-db" className="text-sm text-[--color-black-200]">DB</Label>
              <Input
                id="env-db"
                type="number"
                min={0}
                placeholder="0"
                className="border-[--color-black-700] bg-[--color-black-800] text-[--color-black-50] placeholder:text-[--color-black-500] focus:border-[--color-electric-rose-400] focus:ring-[--color-electric-rose-500]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm text-[--color-black-200]">
              <Checkbox id="env-tls" />
              <span>Usar TLS</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-[--color-black-200]">
              <Checkbox id="env-skip" />
              <span>Omitir verificación TLS</span>
            </label>
          </div>
        </div>

        <DialogFooter className="mt-2 gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" className="text-[--color-black-200] hover:bg-[--color-black-800]" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="outline" className="border-[--color-dark-orange-400] text-[--color-black-50] hover:bg-[--color-dark-orange-500]/15">
            Probar conexión
          </Button>
          <Button className="bg-[--color-electric-rose-500] text-[--color-black-50] hover:bg-[--color-electric-rose-400]">
            Guardar (mock)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
