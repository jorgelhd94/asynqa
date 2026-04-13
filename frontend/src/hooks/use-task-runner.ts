import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as TaskRunnerService from "../../wailsjs/go/taskrunner/TaskRunnerService";
import type { taskrunner } from "../../wailsjs/go/models";

export function useEnqueueTask(environmentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: taskrunner.EnqueueRequest) =>
      TaskRunnerService.EnqueueTask(environmentId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queues", environmentId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", environmentId] });
      queryClient.invalidateQueries({
        queryKey: ["queue-tasks", environmentId],
      });
    },
  });
}
