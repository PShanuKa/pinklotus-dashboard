import api from "../lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── All Bookings (unified — source can be ONLINE, DASHBOARD, or ALL) ─
export const useOnlineBookingsQuery = (
  filters: { page?: number; limit?: number; search?: string; from?: string; to?: string; roomId?: string; status?: string; source?: string } = {},
  options: any = {}
) => {
  return useQuery({
    queryKey: ["OnlineBookings", filters],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(filters.limit || 20) });
      if (filters.page) params.append("page", String(filters.page));
      if (filters.search) params.append("search", filters.search);
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      if (filters.roomId) params.append("roomId", filters.roomId);
      if (filters.status && filters.status !== "ALL") params.append("status", filters.status);
      if (filters.source && filters.source !== "ALL") params.append("source", filters.source);
      
      const response = await api.get(`/bookings?${params.toString()}`);
      return response.data;
    },
    refetchInterval: 30000,
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

// ── Get Calendar Bookings ──────────────────────────────────────────────────
export const useCalendarBookingsQuery = (
  filters: { start?: string; end?: string } = {},
  options: any = {}
) => {
  return useQuery({
    queryKey: ["CalendarBookings", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.start) params.append("start", filters.start);
      if (filters.end) params.append("end", filters.end);

      const response = await api.get(`/bookings/calendar?${params.toString()}`);
      return response.data; // { success, bookings }
    },
    ...options,
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
