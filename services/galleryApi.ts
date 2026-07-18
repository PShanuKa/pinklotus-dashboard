import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";

// ── Get Gallery Images ────────────────────────────────────────────────
export const useGalleryQuery = (options: any = {}) => {
  return useQuery({
    queryKey: ["GalleryImages"],
    queryFn: async () => {
      const response = await api.get(`/gallery`);
      return response.data; // { success, images }
    },
    ...options,
  });
};

// ── Upload File to S3 ────────────────────────────────────────────────
export const useUploadGalleryFileMutation = (options: any = {}) => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await api.post(`/upload?category=gallery`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data; // { success, url }
    },
    ...options,
  });
};

// ── Save Image to Database ───────────────────────────────────────────
export const useAddGalleryImageMutation = (options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { url: string; category?: string }) => {
      const response = await api.post(`/gallery`, data);
      return response.data; // { success, image }
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["GalleryImages"] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
    ...options,
  });
};

// ── Delete Image ─────────────────────────────────────────────────────
export const useDeleteGalleryImageMutation = (options: any = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/gallery/${id}`);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["GalleryImages"] });
      if (options.onSuccess) options.onSuccess(data, variables, context);
    },
    ...options,
  });
};
