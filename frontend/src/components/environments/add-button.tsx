import { Plus } from "lucide-react";
import * as React from "react";

type AddEnvironmentButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const AddEnvironmentButton = React.forwardRef<
  HTMLButtonElement,
  AddEnvironmentButtonProps
>(({ className = "", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[--color-black-700] bg-[--color-black-900]/70 px-4 py-4 text-sm font-medium text-[--color-black-200] transition hover:border-[--color-electric-rose-400] hover:text-[--color-black-50] hover:bg-[--color-electric-rose-500]/15 hover:shadow-[0_0_0_1px_rgba(215,40,169,0.3)] cursor-pointer ${className}`}
      {...props}
    >
      <Plus className="h-4 w-4" />
      Add new environment
    </button>
  );
});

AddEnvironmentButton.displayName = "AddEnvironmentButton";
