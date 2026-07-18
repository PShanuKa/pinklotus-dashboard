import api from "../lib/axios";
import { useQuery } from "@tanstack/react-query";

// ── Get Reports Summary ──────────────────────────────────────────────────
export const useReportsSummaryQuery = (
  filters: { from?: string; to?: string } = {},
  options: any = {}
) => {
  return useQuery({
    queryKey: ["ReportsSummary", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      
      const response = await api.get(`/reports/summary?${params.toString()}`);
      return response.data;
    },
    ...options,
  });
};
