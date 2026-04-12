import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as QueueService from "../../wailsjs/go/queue/QueueService";

export function useQueues(environmentId: number) {
  return useQuery({
    queryKey: ["queues", environmentId],
    queryFn: () => QueueService.GetQueues(environmentId),
    refetchInterval: 5000,
  });
}

export function usePauseQueue(environmentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (queueName: string) =>
      QueueService.PauseQueue(environmentId, queueName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queues", environmentId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", environmentId] });
    },
  });
}

export function useUnpauseQueue(environmentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (queueName: string) =>
      QueueService.UnpauseQueue(environmentId, queueName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queues", environmentId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", environmentId] });
    },
  });
}

export function useDeleteQueue(environmentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ queueName, force }: { queueName: string; force: boolean }) =>
      QueueService.DeleteQueue(environmentId, queueName, force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queues", environmentId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", environmentId] });
    },
  });
}
