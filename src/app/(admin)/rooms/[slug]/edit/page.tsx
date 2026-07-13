"use client";
import React, { useState, useEffect, KeyboardEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  useUpdateRoomMutation,
  useAddRoomImagesMutation,
  useDeleteRoomImageMutation,
  useUploadImageMutation,
  useApartmentsQuery,
  useRoomsQuery,
} from "../../../../../../services/roomsApi";

// ── Reusable tag-list input ─────────────────────────────────────
function TagListInput({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (items: string[]) => void; placeholder?: string; }) {
  const [input, setInput] = useState("");
  const add = () => { const val = input.trim(); if (val && !items.includes(val)) onChange([...items, val]); setInput(""); };
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") { e.preventDefault(); add(); } };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="flex gap-2 mb-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} placeholder={placeholder}
          className="flex-1 px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
        <button type="button" onClick={add} className="px-4 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors">Add</button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
              <button type="button" onClick={() => remove(i)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Image gallery manager ───────────────────────────────────────
function ImageGallery({
  roomId,
  existingImages,
  newImages,
  onNewImagesChange,
  onDeleteExisting,
}: {
  roomId: string;
  existingImages: { id: string; url: string }[];
  newImages: string[];
  onNewImagesChange: (imgs: string[]) => void;
  onDeleteExisting: (imageId: string) => void;
}) {
  const [input, setInput] = useState("");
  const add = () => { if (input.trim()) { onNewImagesChange([...newImages, input.trim()]); setInput(""); } };
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter") { e.preventDefault(); add(); } };

  const uploadMutation = useUploadImageMutation({
    onSuccess: (data: any) => {
      if (data.url) {
        onNewImagesChange([...newImages, data.url]);
      }
    },
    onError: (err: any) => {
      alert("Failed to upload image: " + (err.response?.data?.message || err.message));
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      uploadMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} placeholder="https://res.cloudinary.com/... or upload image"
          className="flex-1 px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
        <button type="button" onClick={add} className="px-4 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors">Add</button>
        <div className="relative">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploadMutation.isPending}
          />
          <button 
            type="button" 
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2"
          >
            {uploadMutation.isPending ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            )}
            Upload File
          </button>
        </div>
      </div>

      {/* Existing images */}
      {existingImages.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Saved ({existingImages.length})</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video bg-gray-100 dark:bg-gray-800">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button type="button" onClick={() => onDeleteExisting(img.id)} className="p-1.5 bg-red-500 text-white rounded-lg">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New images to be added */}
      {newImages.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">New — will be saved on submit ({newImages.length})</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {newImages.map((url, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-dashed border-brand-300 dark:border-brand-700 aspect-video bg-gray-100 dark:bg-gray-800">
                <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button type="button" onClick={() => onNewImagesChange(newImages.filter((_, j) => j !== i))} className="p-1.5 bg-red-500 text-white rounded-lg">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <p className="absolute bottom-0 left-0 right-0 px-2 py-1 text-[10px] text-white bg-black/60 truncate">{url}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass = "w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

// ── Edit Page ─────────────────────────────────────────────────────
export default function EditRoomPage() {
  const params = useParams<{ slug: string }>();
  const roomId = params.slug; // folder is [slug] but we pass room.id in URL
  const router = useRouter();

  const { data: roomsData, isLoading: loadingRooms } = useRoomsQuery();
  const { data: aptData } = useApartmentsQuery();

  const room = roomsData?.rooms?.find((r: any) => r.id === roomId) ?? null;
  const apartments = aptData?.apartments ?? [];

  const [form, setForm] = useState({
    slug: "", roomNumber: "", name: "", miniDesc: "", description: "",
    pricePerNight: "", area: "", maxGuests: "2", bedType: "",
    status: "AVAILABLE", apartmentId: "",
  });
  const [amenities, setAmenities] = useState<string[]>([]);
  const [includedItems, setIncludedItems] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [error, setError] = useState("");

  // Pre-populate form once room data loads
  useEffect(() => {
    if (room) {
      setForm({
        slug: room.slug,
        roomNumber: room.roomNumber || "",
        name: room.name,
        miniDesc: room.miniDesc || "",
        description: room.description || "",
        pricePerNight: String(room.pricePerNight),
        area: String(room.area || ""),
        maxGuests: String(room.maxGuests),
        bedType: room.bedType || "",
        status: room.status,
        apartmentId: room.apartment?.id || "",
      });
      setAmenities(room.amenities ?? []);
      setIncludedItems(room.includedItems ?? []);
      setExistingImages(room.images ?? []);
    }
  }, [room]);

  const updateMutation = useUpdateRoomMutation({
    onSuccess: () => router.push("/rooms"),
    onError: (e: any) => setError(e.response?.data?.message || "Failed to update room."),
  });

  const addImagesMutation = useAddRoomImagesMutation();
  const deleteImageMutation = useDeleteRoomImageMutation({
    onSuccess: (_: any, vars: any) => setExistingImages((prev) => prev.filter((img) => img.id !== vars.imageId)),
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. Update room fields + amenities/includedItems
    updateMutation.mutate({
      id: room.id,
      ...form,
      pricePerNight: parseFloat(form.pricePerNight),
      area: form.area ? parseFloat(form.area) : undefined,
      maxGuests: parseInt(form.maxGuests),
      apartmentId: form.apartmentId || null,
      amenities,
      includedItems,
    });

    // 2. Add new images if any
    if (newImages.length > 0) {
      addImagesMutation.mutate({ id: room.id, urls: newImages });
      setNewImages([]);
    }
  };

  if (loadingRooms) return (
    <div className="flex items-center justify-center py-32 text-gray-400">
      <svg className="w-6 h-6 animate-spin mr-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
      Loading room...
    </div>
  );

  if (!room) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <p className="text-gray-500 dark:text-gray-400">Room not found.</p>
      <Link href="/rooms" className="text-sm text-brand-500 hover:underline">← Back to Rooms</Link>
    </div>
  );

  const isSaving = updateMutation.isPending || addImagesMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/rooms" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Room</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Editing: <span className="font-medium text-gray-700 dark:text-gray-300">{room.name}</span></p>
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Basic Info ──────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Slug <span className="text-red-500">*</span></label>
              <input required value={form.slug} onChange={set("slug")} className={inputClass} />
              <p className="mt-1 text-xs text-gray-400">Used in the URL. Must be unique.</p>
            </div>
            <div>
              <label className={labelClass}>Room Number</label>
              <input value={form.roomNumber} onChange={set("roomNumber")} placeholder="101" className={inputClass} />
            </div>
            <div className="col-span-full">
              <label className={labelClass}>Room Name <span className="text-red-500">*</span></label>
              <input required value={form.name} onChange={set("name")} className={inputClass} />
            </div>
            <div className="col-span-full">
              <label className={labelClass}>Mini Description <span className="text-gray-400 font-normal">(tagline shown on card)</span></label>
              <input value={form.miniDesc} onChange={set("miniDesc")} className={inputClass} />
            </div>
            <div className="col-span-full">
              <label className={labelClass}>Full Description</label>
              <textarea rows={4} value={form.description} onChange={set("description")} className={inputClass} />
            </div>
          </div>
        </div>

        {/* ── Room Details ────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Room Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Price / Night ($) <span className="text-red-500">*</span></label>
              <input required type="number" step="0.01" min="0" value={form.pricePerNight} onChange={set("pricePerNight")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Area (m²)</label>
              <input type="number" step="0.1" min="0" value={form.area} onChange={set("area")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max Guests</label>
              <input type="number" min="1" value={form.maxGuests} onChange={set("maxGuests")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Bed Type</label>
              <input value={form.bedType} onChange={set("bedType")} placeholder="1 King Bed" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={set("status")} className={inputClass}>
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Apartment <span className="text-gray-400 font-normal">(optional)</span></label>
              <select value={form.apartmentId} onChange={set("apartmentId")} className={inputClass}>
                <option value="">— Standalone Room —</option>
                {apartments.map((a: any) => (<option key={a.id} value={a.id}>{a.name}</option>))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Amenities ────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Amenities & Inclusions</h2>
          <TagListInput label="Amenities" items={amenities} onChange={setAmenities} placeholder="e.g. Air Conditioner (press Enter or click Add)" />
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <TagListInput label="What's Included in This Room" items={includedItems} onChange={setIncludedItems} placeholder="e.g. Private balcony (press Enter or click Add)" />
          </div>
        </div>

        {/* ── Images ───────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Gallery Images</h2>
          <ImageGallery
            roomId={room.id}
            existingImages={existingImages}
            newImages={newImages}
            onNewImagesChange={setNewImages}
            onDeleteExisting={(imageId) => deleteImageMutation.mutate({ id: room.id, imageId })}
          />
        </div>

        {/* ── Submit ───────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Link href="/rooms" className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={isSaving} className="px-6 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-60 rounded-xl transition-colors shadow-sm">
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
