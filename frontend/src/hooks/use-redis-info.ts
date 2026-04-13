import { useQuery } from "@tanstack/react-query";
import * as RedisService from "../../wailsjs/go/redis/RedisService";

export function useRedisInfo(environmentId: number) {
  return useQuery({
    queryKey: ["redis-info", environmentId],
    queryFn: () => RedisService.GetRedisInfo(environmentId),
    refetchInterval: 10000,
  });
}
