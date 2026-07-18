"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { 
  useGalleryQuery, 
  useUploadGalleryFileMutation, 
  useAddGalleryImageMutation,
  useDeleteGalleryImageMutation
} from "../../../../services/galleryApi";

export default function GalleryManagementPage() {
  const { data, isLoading } = useGalleryQuery();
  const uploadMutation = useUploadGalleryFileMutation();
  const addMutation = useAddGalleryImageMutation();
  const deleteMutation = useDeleteGalleryImageMutation();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [category, setCategory] = useState("general");

  const images = data?.images || [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Upload to S3
      const uploadRes = await uploadMutation.mutateAsync(file);
      if (uploadRes.success && uploadRes.url) {
        // 2. Save to database
        await addMutation.mutateAsync({
          url: uploadRes.url,
          category,
        });
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Delete failed", error);
        alert("Failed to delete image.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gallery Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upload and manage images for the website gallery</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="general">General</option>
            <option value="rooms">Rooms</option>
            <option value="exterior">Exterior</option>
            <option value="dining">Dining</option>
          </select>

          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isUploading ? (
              <span>Uploading...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Upload Image
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-gray-500">Loading gallery...</div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <svg className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <p>No images in gallery yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((img: any) => (
              <div key={img.id} className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <Image 
                  src={img.url} 
                  alt="Gallery image" 
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 20vw"
                  unoptimized // since we are using S3 URLs that might not be configured in next.config.js
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-1 bg-black/60 text-white text-[10px] font-medium rounded uppercase tracking-wider">
                      {img.category}
                    </span>
                    <button 
                      onClick={() => handleDelete(img.id)}
                      className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      title="Delete Image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-300">
                    {new Date(img.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
