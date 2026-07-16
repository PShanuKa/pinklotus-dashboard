import api from "../lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Bookings ──────────────────────────────────────────────────
export const useOnlineBookingsQuery = (options: any = {}) => {
  return useQuery({
    queryKey: ["OnlineBookings"],
    queryFn: async () => {
      const response = await api.get("/bookings?source=ONLINE");
      return response.data;
    },
    ...options,
  });
};

export const useDashboardBookingsQuery = (options: any = {}) => {
  return useQuery({
    queryKey: ["DashboardBookings"],
    queryFn: async () => {
      const response = await api.get("/bookings?source=DASHBOARD");
      return response.data;
    },
    ...options,
  });
};

export const useUpdateBookingMutation = (options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await api.put(`/bookings/${id}`, data);
      return response.data;
    },
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: ["OnlineBookings"] });
      queryClient.invalidateQueries({ queryKey: ["DashboardBookings"] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};

export const useDeleteBookingMutation = (options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/bookings/${id}`);
      return response.data;
    },
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: ["OnlineBookings"] });
      queryClient.invalidateQueries({ queryKey: ["DashboardBookings"] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};

export const useCreateDashboardBookingMutation = (options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async (data: any) => {
      const response = await api.post("/bookings", data);
      return response.data;
    },
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: ["DashboardBookings"] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};
