import api from "../lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Auth/Login ──────────────────────────────────────────────────
export const useLoginMutation = (options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async (data: any) => {
      const response = await api.post("/auth/login", data);
      return response.data;
    },
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: ["Auth"] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};

// ── Get My Profile ──────────────────────────────────────────────────
export const useGetMyProfile = (options: any = {}) => {
  return useQuery<any>({
    queryKey: ["MyProfile"],
    queryFn: async () => {
      const response = await api.get("/auth/me");
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data.user;
    },
    ...options,
  });
};

// ── System Users ─────────────────────────────────────────────────
export const useUsersQuery = (
  filters: { page?: number; limit?: number; search?: string; role?: string } = {},
  options: any = {}
) => {
  return useQuery({
    queryKey: ["SystemUsers", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));
      if (filters.search) params.append("search", filters.search);
      if (filters.role && filters.role !== "ALL") params.append("role", filters.role);
      
      const response = await api.get(`/auth/users?${params.toString()}`);
      return response.data;
    },
    ...options,
  });
};

export const useCreateUserMutation = (options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async (data: any) => {
      const response = await api.post("/auth/create", data);
      return response.data;
    },
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: ["SystemUsers"] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};

export const useUpdateUserMutation = (options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await api.put(`/auth/users/${id}`, data);
      return response.data;
    },
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: ["SystemUsers"] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};

export const useDeleteUserMutation = (options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/auth/users/${id}`);
      return response.data;
    },
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: ["SystemUsers"] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};

// ── Customers ─────────────────────────────────────────────────────
export const useCustomersQuery = (options: any = {}) => {
  return useQuery({
    queryKey: ["Customers"],
    queryFn: async () => {
      const response = await api.get("/customers/list");
      return response.data;
    },
    ...options,
  });
};

export const useUpdateCustomerMutation = (options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await api.put(`/customers/${id}`, data);
      return response.data;
    },
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: ["Customers"] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};

export const useDeleteCustomerMutation = (options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/customers/${id}`);
      return response.data;
    },
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: ["Customers"] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};
