import { useQuery } from "@tanstack/react-query";
import { EnvironmentService } from "@bindings/internal/services";

export function useEnvironment(id: number) {
  return useQuery({
    queryKey: ["environments", id],
    queryFn: () => EnvironmentService.GetAll(),
    select: (envs) => envs.find((e) => e.ID === id),
  });
}
