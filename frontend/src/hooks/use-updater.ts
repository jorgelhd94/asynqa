import { useMutation, useQuery } from "@tanstack/react-query";
import * as UpdaterService from "../../wailsjs/go/updater/UpdaterService";

export function useCurrentVersion() {
  return useQuery({
    queryKey: ["current-version"],
    queryFn: () => UpdaterService.GetCurrentVersion(),
    staleTime: Infinity,
  });
}

export function useCheckForUpdate() {
  return useQuery({
    queryKey: ["check-update"],
    queryFn: () => UpdaterService.CheckForUpdate(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useApplyUpdate() {
  return useMutation({
    mutationFn: () => UpdaterService.ApplyUpdate(),
  });
}
