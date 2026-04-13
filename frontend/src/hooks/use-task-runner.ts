import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useSavedRequests(environmentId: number) {
  return useQuery({
    queryKey: ["saved-requests", environmentId],
    queryFn: () => TaskRunnerService.GetSavedRequests(environmentId),
  });
}

export function useSavedRequest(requestId: number) {
  return useQuery({
    queryKey: ["saved-request", requestId],
    queryFn: () => TaskRunnerService.GetSavedRequest(requestId),
    enabled: requestId > 0,
  });
}

export function useCreateSavedRequest(environmentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: taskrunner.CreateSavedRequestInput) =>
      TaskRunnerService.CreateSavedRequest(environmentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["saved-requests", environmentId],
      });
    },
  });
}

export function useUpdateSavedRequest(environmentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      input,
    }: {
      requestId: number;
      input: taskrunner.UpdateSavedRequestInput;
    }) => TaskRunnerService.UpdateSavedRequest(requestId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["saved-requests", environmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["saved-request", variables.requestId],
      });
    },
  });
}

export function useRenameSavedRequest(environmentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      input,
    }: {
      requestId: number;
      input: taskrunner.RenameSavedRequestInput;
    }) => TaskRunnerService.RenameSavedRequest(requestId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["saved-requests", environmentId],
      });
    },
  });
}

export function useCloneSavedRequest(environmentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) =>
      TaskRunnerService.CloneSavedRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["saved-requests", environmentId],
      });
    },
  });
}

export function useDeleteSavedRequest(environmentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: number) =>
      TaskRunnerService.DeleteSavedRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["saved-requests", environmentId],
      });
    },
  });
}
