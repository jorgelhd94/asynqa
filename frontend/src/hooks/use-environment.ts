import { useQuery } from "@tanstack/react-query";
import * as EnvironmentService from "../../wailsjs/go/service/EnvironmentService";

export function useEnvironment(id: number) {
  return useQuery({
    queryKey: ["environments", id],
    queryFn: () => EnvironmentService.GetAll(),
    select: (envs) => envs.find((e) => e.ID === id),
  });
}
