import api from "../lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Get All Settings ────────────────────────────────────────────────────────
export const useSettingsQuery = (options: any = {}) => {
  return useQuery({
    queryKey: ["Settings"],
    queryFn: async () => {
      const response = await api.get("/settings");
      return response.data;
    },
    ...options,
  });
};

// ── Update Settings in Bulk ──────────────────────────────────────────────────
export const useUpdateSettingsMutation = (options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async (data: Record<string, string>) => {
      const response = await api.put("/settings", data);
      return response.data;
    },
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: ["Settings"] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};
