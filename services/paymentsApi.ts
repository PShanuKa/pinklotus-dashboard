import api from "../lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Get Payments for a Booking ───────────────────────────────────────────────
export const useBookingPaymentsQuery = (bookingId: string, options: any = {}) => {
  return useQuery({
    queryKey: ["BookingPayments", bookingId],
    queryFn: async () => {
      const response = await api.get(`/payments/booking/${bookingId}`);
      return response.data;
    },
    enabled: !!bookingId,
    ...options,
  });
};

// ── Record Manual Payment ──────────────────────────────────────────────────
export const useRecordPaymentMutation = (options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async (data: { bookingId: string; amount: number; method: string; status?: string; transactionId?: string; referenceId?: string }) => {
      const response = await api.post("/payments", data);
      return response.data;
    },
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: ["BookingPayments", variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ["OnlineBookings"] });
      queryClient.invalidateQueries({ queryKey: ["DashboardBookings"] });
      queryClient.invalidateQueries({ queryKey: ["AllBookings"] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};

// ── Update Payment ──────────────────────────────────────────────────────────
export const useUpdatePaymentMutation = (options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async ({ id, ...data }: { id: string; status: string }) => {
      const response = await api.put(`/payments/${id}`, data);
      return response.data;
    },
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: ["BookingPayments"] });
      queryClient.invalidateQueries({ queryKey: ["OnlineBookings"] });
      queryClient.invalidateQueries({ queryKey: ["DashboardBookings"] });
      queryClient.invalidateQueries({ queryKey: ["AllBookings"] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};

// ── Delete Payment ──────────────────────────────────────────────────────────
export const useDeletePaymentMutation = (options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/payments/${id}`);
      return response.data;
    },
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: ["BookingPayments"] });
      queryClient.invalidateQueries({ queryKey: ["OnlineBookings"] });
      queryClient.invalidateQueries({ queryKey: ["DashboardBookings"] });
      queryClient.invalidateQueries({ queryKey: ["AllBookings"] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};
