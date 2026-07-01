import api from "../lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Apartments ────────────────────────────────────────────────
export const useApartmentsQuery = (options: any = {}) =>
  useQuery({ queryKey: ["Apartments"], queryFn: async () => (await api.get("/apartments")).data, ...options });

export const useCreateApartmentMutation = (options: any = {}) => {
  const qc = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async (data) => (await api.post("/apartments", data)).data,
    ...options,
    onSuccess: (d: any, v: any, c: any) => { qc.invalidateQueries({ queryKey: ["Apartments"] }); options.onSuccess?.(d, v, c); },
  });
};

export const useUpdateApartmentMutation = (options: any = {}) => {
  const qc = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async ({ id, ...data }: any) => (await api.put(`/apartments/${id}`, data)).data,
    ...options,
    onSuccess: (d: any, v: any, c: any) => { qc.invalidateQueries({ queryKey: ["Apartments"] }); options.onSuccess?.(d, v, c); },
  });
};

export const useDeleteApartmentMutation = (options: any = {}) => {
  const qc = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async (id: string) => (await api.delete(`/apartments/${id}`)).data,
    ...options,
    onSuccess: (d: any, v: any, c: any) => { qc.invalidateQueries({ queryKey: ["Apartments"] }); options.onSuccess?.(d, v, c); },
  });
};

export const useAddApartmentImagesMutation = (options: any = {}) => {
  const qc = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async ({ id, urls }: any) => (await api.post(`/apartments/${id}/images`, { urls })).data,
    ...options,
    onSuccess: (d: any, v: any, c: any) => { qc.invalidateQueries({ queryKey: ["Apartments"] }); options.onSuccess?.(d, v, c); },
  });
};

export const useDeleteApartmentImageMutation = (options: any = {}) => {
  const qc = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async ({ id, imageId }: any) => (await api.delete(`/apartments/${id}/images/${imageId}`)).data,
    ...options,
    onSuccess: (d: any, v: any, c: any) => { qc.invalidateQueries({ queryKey: ["Apartments"] }); options.onSuccess?.(d, v, c); },
  });
};

// ── Rooms ──────────────────────────────────────────────────────
export const useRoomsQuery = (params: any = {}, options: any = {}) =>
  useQuery({
    queryKey: ["Rooms", params],
    queryFn: async () => (await api.get("/rooms", { params })).data,
    ...options,
  });

export const useCreateRoomMutation = (options: any = {}) => {
  const qc = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async (data) => (await api.post("/rooms", data)).data,
    ...options,
    onSuccess: (d: any, v: any, c: any) => { qc.invalidateQueries({ queryKey: ["Rooms"] }); options.onSuccess?.(d, v, c); },
  });
};

export const useUpdateRoomMutation = (options: any = {}) => {
  const qc = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async ({ id, ...data }: any) => (await api.put(`/rooms/${id}`, data)).data,
    ...options,
    onSuccess: (d: any, v: any, c: any) => { qc.invalidateQueries({ queryKey: ["Rooms"] }); options.onSuccess?.(d, v, c); },
  });
};

export const useDeleteRoomMutation = (options: any = {}) => {
  const qc = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async (id: string) => (await api.delete(`/rooms/${id}`)).data,
    ...options,
    onSuccess: (d: any, v: any, c: any) => { qc.invalidateQueries({ queryKey: ["Rooms"] }); options.onSuccess?.(d, v, c); },
  });
};

export const useAddRoomImagesMutation = (options: any = {}) => {
  const qc = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async ({ id, urls }: any) => (await api.post(`/rooms/${id}/images`, { urls })).data,
    ...options,
    onSuccess: (d: any, v: any, c: any) => { qc.invalidateQueries({ queryKey: ["Rooms"] }); options.onSuccess?.(d, v, c); },
  });
};

export const useDeleteRoomImageMutation = (options: any = {}) => {
  const qc = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async ({ id, imageId }: any) => (await api.delete(`/rooms/${id}/images/${imageId}`)).data,
    ...options,
    onSuccess: (d: any, v: any, c: any) => { qc.invalidateQueries({ queryKey: ["Rooms"] }); options.onSuccess?.(d, v, c); },
  });
};
