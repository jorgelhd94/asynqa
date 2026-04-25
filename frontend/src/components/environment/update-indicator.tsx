import { useState } from "react";
import { Download, ExternalLink, RefreshCw } from "lucide-react";
import { sileo } from "sileo";
import { useCheckForUpdate, useApplyUpdate } from "@/hooks/use-updater";
import { BrowserOpenURL } from "../../../wailsjs/runtime/runtime";
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

type UpdateIndicatorProps = {
  size?: "sm" | "md";
};

export function UpdateIndicator({ size = "sm" }: UpdateIndicatorProps) {
  const { data: updateInfo } = useCheckForUpdate();
  const applyUpdate = useApplyUpdate();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!updateInfo?.available) return null;

  const manualOnly = updateInfo.manualOnly;

  const handleAction = () => {
    if (manualOnly) {
      if (updateInfo.url) BrowserOpenURL(updateInfo.url);
      setDialogOpen(false);
      return;
    }
    applyUpdate.mutate(undefined, {
      onSuccess: (result) => {
        setDialogOpen(false);
        if (result.manualOnly && result.url) {
          BrowserOpenURL(result.url);
          sileo.info({
            title: "Manual update required",
            description: result.message,
          });
          return;
        }
        if (result.success) {
          sileo.success({
            title: `Updated to v${result.version}`,
            description: "Please restart the application.",
          });
          return;
        }
        sileo.error({
          title: "Update failed",
          description: result.message || "Unknown error",
        });
      },
      onError: (error) => {
        setDialogOpen(false);
        sileo.error({
          title: "Update failed",
          description: error.message,
        });
      },
    });
  };

  const triggerClass =
    size === "md"
      ? "flex items-center gap-2 border border-(--color-accent-val)/40 bg-(--color-accent-val)/10 px-3 py-1.5 text-sm text-(--color-accent-val) hover:border-(--color-accent-val) hover:bg-(--color-accent-val)/15 transition-colors"
      : "flex items-center gap-1 text-xs text-(--color-accent-val) hover:text-(--color-accent-light) transition-colors";

  const triggerIconClass = size === "md" ? "h-3.5 w-3.5" : "h-2.5 w-2.5";

  return (
    <>
      <button onClick={() => setDialogOpen(true)} className={triggerClass}>
        <Download className={triggerIconClass} />
        <span>v{updateInfo.latestVersion} available</span>
      </button>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Available</AlertDialogTitle>
            <AlertDialogDescription>
              A new version <strong>v{updateInfo.latestVersion}</strong> is available.
              You are currently on <strong>v{updateInfo.currentVersion}</strong>.
              {manualOnly
                ? " Automatic updates are not supported on macOS. Open the release page to download the new version manually."
                : " The application will need to restart after updating."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Later</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={applyUpdate.isPending}
            >
              {applyUpdate.isPending ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Updating...
                </>
              ) : manualOnly ? (
                <>
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open release page
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
