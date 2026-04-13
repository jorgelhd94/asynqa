import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Environment } from "./types";

type DeleteEnvironmentDialogProps = {
  environment: Environment | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (env: Environment) => void;
};

export function DeleteEnvironmentDialog({
  environment,
  open,
  onOpenChange,
  onConfirm,
}: DeleteEnvironmentDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md border-[var(--color-divider)] text-[var(--color-text-primary)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[var(--color-text-primary)]">
            Delete environment
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[var(--color-text-secondary)]">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[var(--color-text-primary)]">
              "{environment?.Name}"
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-[var(--color-divider)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-dark)] hover:text-[var(--color-text-primary)]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/80"
            onClick={() => environment && onConfirm(environment)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
