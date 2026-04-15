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
      <AlertDialogContent className="max-w-md border-(--color-divider) text-(--color-text-primary)">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-(--color-text-primary)">
            Delete environment
          </AlertDialogTitle>
          <AlertDialogDescription className="text-(--color-text-secondary)">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-(--color-text-primary)">
              "{environment?.Name}"
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-(--color-divider) text-(--color-text-secondary) hover:bg-(--color-primary-dark) hover:text-(--color-text-primary)">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-(--color-error) text-white hover:bg-(--color-error)/80"
            onClick={() => environment && onConfirm(environment)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
