import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { useCheckForUpdate, useApplyUpdate } from "@/hooks/use-updater";
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

export function UpdateIndicator() {
  const { data: updateInfo } = useCheckForUpdate();
  const applyUpdate = useApplyUpdate();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!updateInfo?.available) return null;

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
        className="flex items-center gap-1 text-xs text-(--color-accent-val) hover:text-(--color-accent-light) transition-colors"
      >
        <Download className="h-2.5 w-2.5" />
        <span>v{updateInfo.latestVersion} available</span>
      </button>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Available</AlertDialogTitle>
            <AlertDialogDescription>
              A new version <strong>v{updateInfo.latestVersion}</strong> is available.
              You are currently on <strong>v{updateInfo.currentVersion}</strong>.
              The application will need to restart after updating.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Later</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => applyUpdate.mutate()}
              disabled={applyUpdate.isPending}
            >
              {applyUpdate.isPending ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  Update Now
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
