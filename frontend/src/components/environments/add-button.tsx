import { Plus } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Button } from "../ui/button";

export const AddEnvironmentButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(({ className = "", ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="ghost"
      className={`mt-2 w-full justify-center gap-2 rounded-2xl border border-dashed border-[--color-black-700] bg-[--color-black-900]/70 px-4 py-4 text-sm font-semibold text-[--color-black-100] transition hover:border-[--color-dark-orange-400] hover:text-[--color-black-50] hover:bg-[--color-dark-orange-500]/15 hover:shadow-[0_0_0_1px_rgba(255,123,0,0.35)] ${className}`}
      {...props}
    >
      <Plus className="h-4 w-4" />
      Add new environment
    </Button>
  );
});

AddEnvironmentButton.displayName = "AddEnvironmentButton";
