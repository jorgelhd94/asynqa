import { useQuery } from "@tanstack/react-query";
import * as SchedulerService from "../../wailsjs/go/scheduler/SchedulerService";

export function useSchedulerEntries(environmentId: number) {
  return useQuery({
    queryKey: ["schedulers", environmentId],
    queryFn: () => SchedulerService.GetSchedulerEntries(environmentId),
    refetchInterval: 5000,
  });
}

export function useEnqueueEvents(
  environmentId: number,
  entryId: string,
  page: number,
  pageSize: number,
  enabled: boolean
) {
  return useQuery({
    queryKey: ["enqueue-events", environmentId, entryId, page, pageSize],
    queryFn: () =>
      SchedulerService.GetEnqueueEvents(environmentId, entryId, page, pageSize),
    refetchInterval: 5000,
    enabled,
  });
}
