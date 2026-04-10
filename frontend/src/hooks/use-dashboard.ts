import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@bindings/internal/services";

export function useDashboard(environmentId: number) {
  return useQuery({
    queryKey: ["dashboard", environmentId],
    queryFn: () => DashboardService.GetDashboard(environmentId),
    refetchInterval: 5000,
  });
}
