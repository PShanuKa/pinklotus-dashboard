import api from "../lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useDashboardStatsQuery = (options: any = {}) => {
  return useQuery({
    queryKey: ["DashboardStats"],
    queryFn: async () => {
      const response = await api.get("/dashboard/stats");
      return response.data.stats;
    },
    refetchInterval: 60000, // Refresh every 60 seconds
    ...options,
  });
};
