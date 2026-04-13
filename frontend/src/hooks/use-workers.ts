import { useQuery } from "@tanstack/react-query";
import * as WorkerService from "../../wailsjs/go/worker/WorkerService";

export function useWorkers(environmentId: number) {
  return useQuery({
    queryKey: ["workers", environmentId],
    queryFn: () => WorkerService.GetWorkers(environmentId),
    refetchInterval: 5000,
  });
}
