import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as EnvironmentService from "../../wailsjs/go/environment/EnvironmentService";
import { domain } from "../../wailsjs/go/models";
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
      EnvironmentService.Create(new domain.Environment(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENVIRONMENTS_KEY });
    },
  });
}

export function useUpdateEnvironment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EnvironmentFormData & { ID: number }) =>
      EnvironmentService.Update(new domain.Environment(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENVIRONMENTS_KEY });
    },
  });
}

export function useTestConnection() {
  return useMutation({
    mutationFn: (data: EnvironmentFormData | domain.Environment) =>
      EnvironmentService.TestConnection(
        data instanceof domain.Environment ? data : new domain.Environment(data),
      ),
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
