import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EnvironmentService } from "@bindings/internal/services";
import { Environment } from "@bindings/internal/domain/models";
import type { EnvironmentFormData } from "@/components/environments/types";

const ENVIRONMENTS_KEY = ["environments"];

export function useEnvironments() {
  return useQuery({
    queryKey: ENVIRONMENTS_KEY,
    queryFn: () => EnvironmentService.GetAll(),
  });
}

export function useCreateEnvironment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EnvironmentFormData) =>
      EnvironmentService.Create(new Environment(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENVIRONMENTS_KEY });
    },
  });
}

export function useUpdateEnvironment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EnvironmentFormData & { ID: number }) =>
      EnvironmentService.Update(new Environment(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENVIRONMENTS_KEY });
    },
  });
}

export function useTestConnection() {
  return useMutation({
    mutationFn: (data: EnvironmentFormData) =>
      EnvironmentService.TestConnection(new Environment(data)),
  });
}

export function useDeleteEnvironment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => EnvironmentService.Delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENVIRONMENTS_KEY });
    },
  });
}
