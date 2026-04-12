import { useQuery } from "@tanstack/react-query";
import * as DashboardService from "../../wailsjs/go/services/DashboardService";

export function useDashboard(environmentId: number) {
  return useQuery({
    queryKey: ["dashboard", environmentId],
    queryFn: () => DashboardService.GetDashboard(environmentId),
    refetchInterval: 5000,
  });
}
