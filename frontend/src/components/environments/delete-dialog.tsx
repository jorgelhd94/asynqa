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
      <AlertDialogContent className="max-w-md border-[--color-black-800] text-[--color-black-50] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[--color-black-50]">
            Delete environment
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[--color-black-300]">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[--color-black-100]">
              "{environment?.Name}"
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-[--color-black-700] text-[--color-black-200] hover:bg-[--color-black-800] hover:text-[--color-black-50]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-[--color-vibrant-coral-500] text-white hover:bg-[--color-vibrant-coral-400]"
            onClick={() => environment && onConfirm(environment)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
