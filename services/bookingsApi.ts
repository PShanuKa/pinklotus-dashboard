import api from "../lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Online Bookings (source=ONLINE) ───────────────────────────
export const useOnlineBookingsQuery = (options: any = {}) => {
  return useQuery({
    queryKey: ["OnlineBookings"],
    queryFn: async () => {
      const response = await api.get("/bookings?source=ONLINE&limit=100");
      return response.data;
    },
    refetchInterval: 30000, // Auto-refresh every 30s
    ...options,
  });
};

// ── Dashboard Bookings (source=DASHBOARD) ─────────────────────
export const useDashboardBookingsQuery = (options: any = {}) => {
  return useQuery({
    queryKey: ["DashboardBookings"],
    queryFn: async () => {
      const response = await api.get("/bookings?source=DASHBOARD&limit=100");
      return response.data;
    },
    refetchInterval: 30000,
    ...options,
  });
};

// ── All Bookings (no source filter) for POS ───────────────────
export const useAllBookingsQuery = (options: any = {}) => {
  return useQuery({
    queryKey: ["AllBookings"],
    queryFn: async () => {
      const response = await api.get("/bookings?limit=200");
      return response.data;
    },
    refetchInterval: 30000,
    ...options,
  });
};

// ── Active Today bookings for POS ─────────────────────────────
export const useActiveTodayQuery = (options: any = {}) => {
  return useQuery({
    queryKey: ["ActiveToday"],
    queryFn: async () => {
      const response = await api.get("/bookings/active-today");
      return response.data;
    },
    refetchInterval: 30000,
    ...options,
  });
};

// ── Update Booking ────────────────────────────────────────────
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
      queryClient.invalidateQueries({ queryKey: ["AllBookings"] });
      queryClient.invalidateQueries({ queryKey: ["ActiveToday"] });
      queryClient.invalidateQueries({ queryKey: ["Rooms"] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};

// ── Delete Booking ────────────────────────────────────────────
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
      queryClient.invalidateQueries({ queryKey: ["AllBookings"] });
      queryClient.invalidateQueries({ queryKey: ["ActiveToday"] });
      queryClient.invalidateQueries({ queryKey: ["Rooms"] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};

// ── Create Booking (POS walk-in) ──────────────────────────────
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
      queryClient.invalidateQueries({ queryKey: ["AllBookings"] });
      queryClient.invalidateQueries({ queryKey: ["ActiveToday"] });
      queryClient.invalidateQueries({ queryKey: ["Rooms"] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};

// ── Quick Create Customer ─────────────────────────────────────
export const useQuickCreateCustomerMutation = (options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async (data: any) => {
      const response = await api.post("/customers/quick", data);
      return response.data;
    },
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: ["Customers"] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};
