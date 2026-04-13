import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  useSavedRequests,
  useRenameSavedRequest,
  useCloneSavedRequest,
  useDeleteSavedRequest,
} from "@/hooks/use-task-runner";
import { Copy, MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";
import { taskrunner } from "../../../wailsjs/go/models";

type SidebarSavedRequestsProps = {
  environmentId: number;
};

export function SidebarSavedRequests({ environmentId }: SidebarSavedRequestsProps) {
  const id = String(environmentId);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: requests = [] } = useSavedRequests(environmentId);
  const renameMutation = useRenameSavedRequest(environmentId);
  const cloneMutation = useCloneSavedRequest(environmentId);
  const deleteMutation = useDeleteSavedRequest(environmentId);

  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId !== null && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const isActive = (requestId: number) => {
    return location.pathname === `/environment/${id}/task-runner/${requestId}`;
  };

  const handleStartRename = (requestId: number, currentName: string) => {
    setRenamingId(requestId);
    setRenameValue(currentName);
  };

  const handleConfirmRename = () => {
    if (renamingId !== null && renameValue.trim()) {
      renameMutation.mutate({
        requestId: renamingId,
        input: new taskrunner.RenameSavedRequestInput({ name: renameValue.trim() }),
      });
    }
    setRenamingId(null);
  };

  const handleClone = (requestId: number) => {
    cloneMutation.mutate(requestId, {
      onSuccess: (cloned) => {
        navigate({
          to: "/environment/$id/task-runner/$requestId",
          params: { id, requestId: String(cloned.id) },
        });
      },
    });
  };

  const handleConfirmDelete = () => {
    if (deleteId === null) return;

    const wasActive = isActive(deleteId);
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        if (wasActive) {
          navigate({
            to: "/environment/$id/task-runner",
            params: { id },
          });
        }
      },
    });
    setDeleteId(null);
  };

  if (requests.length === 0) return null;

  return (
    <>
      <SidebarMenu>
        {requests.map((req) => (
          <SidebarMenuItem key={req.id}>
            {renamingId === req.id ? (
              <div className="px-2 py-1">
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={handleConfirmRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConfirmRename();
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  className="h-7 w-full rounded border border-[var(--color-accent-val)] bg-[--color-primary-bg] px-2 text-xs text-[--color-text-primary] outline-none"
                />
              </div>
            ) : (
              <>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(req.id)}
                  tooltip={req.name}
                  size="sm"
                >
                  <Link
                    to="/environment/$id/task-runner/$requestId"
                    params={{ id, requestId: String(req.id) }}
                  >
                    <Send className="h-3 w-3" />
                    <span className="truncate">{req.name}</span>
                  </Link>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover>
                      <MoreHorizontal />
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start" sideOffset={4}>
                    <DropdownMenuItem
                      onClick={() => handleStartRename(req.id, req.name)}
                      className="gap-2 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleClone(req.id)}
                      className="gap-2 text-xs"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Clone
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteId(req.id)}
                      className="gap-2 text-xs text-[--color-error] focus:text-[--color-error]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this saved request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-[--color-error] hover:bg-[--color-error]/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
