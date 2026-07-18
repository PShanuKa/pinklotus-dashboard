import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";

// ── Get Inquiries ──────────────────────────────────────────────────
export const useInquiriesQuery = (options: any = {}) => {
  return useQuery({
    queryKey: ["Inquiries"],
    queryFn: async () => {
      const response = await api.get("/inquiries");
      return response.data;
    },
    ...options,
  });
};

// ── Mark Inquiry as Read ──────────────────────────────────────────
export const useMarkInquiryReadMutation = (options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/inquiries/${id}/read`);
      return response.data;
    },
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: ["Inquiries"] });
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
};

// ── Delete Inquiry ────────────────────────────────────────────────
export const useDeleteInquiryMutation = (options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/inquiries/${id}`);
      return response.data;
    },
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: ["Inquiries"] });
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
};
