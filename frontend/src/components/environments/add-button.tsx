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
      className={`mt-2 w-full justify-center gap-2 border border-dashed border-[var(--color-divider)] bg-[var(--color-primary-light)] px-4 py-4 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-accent-val)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-accent-val)]/10 ${className}`}
      {...props}
    >
      <Plus className="h-4 w-4" />
      Add new environment
    </Button>
  );
});

AddEnvironmentButton.displayName = "AddEnvironmentButton";
