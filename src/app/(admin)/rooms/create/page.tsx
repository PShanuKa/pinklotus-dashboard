"use client";
import React, { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCreateRoomMutation } from "../../../../../services/roomsApi";
import { useApartmentsQuery } from "../../../../../services/roomsApi";

// ── Reusable tag-list input ─────────────────────────────────────
function TagListInput({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const val = input.trim();
    if (val && !items.includes(val)) {
      onChange([...items, val]);
    }
    setInput("");
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); add(); }
  };

  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="flex gap-2 mb-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className="flex-1 px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="button"
          onClick={add}
          className="px-4 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors"
        >
          Add
        </button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Image URL list input ────────────────────────────────────────
function ImageUrlInput({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const val = input.trim();
    if (val) { onChange([...images, val]); setInput(""); }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); add(); }
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Images</label>
      <div className="flex gap-2 mb-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="https://res.cloudinary.com/..."
          className="flex-1 px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button type="button" onClick={add} className="px-4 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors">Add</button>
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video bg-gray-100 dark:bg-gray-800">
              <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button type="button" onClick={() => remove(i)} className="p-1.5 bg-red-500 text-white rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="absolute bottom-0 left-0 right-0 px-2 py-1 text-[10px] text-white bg-black/60 truncate">{url}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Input helpers ────────────────────────────────────────────────
const inputClass = "w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

// ── Page ─────────────────────────────────────────────────────────
export default function CreateRoomPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    slug: "", roomNumber: "", name: "", miniDesc: "", description: "",
    pricePerNight: "", area: "", maxGuests: "2", bedType: "",
    status: "AVAILABLE", apartmentId: "",
  });
  const [amenities, setAmenities] = useState<string[]>([]);
  const [includedItems, setIncludedItems] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");

  const { data: aptData } = useApartmentsQuery();
  const apartments = aptData?.apartments ?? [];

  const createMutation = useCreateRoomMutation({
    onSuccess: () => router.push("/rooms"),
    onError: (e: any) => setError(e.response?.data?.message || "Failed to create room."),
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    createMutation.mutate({
      ...form,
      pricePerNight: parseFloat(form.pricePerNight),
      area: form.area ? parseFloat(form.area) : undefined,
      maxGuests: parseInt(form.maxGuests),
      apartmentId: form.apartmentId || null,
      amenities,
      includedItems,
      images,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/rooms"
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Room</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Fill in the details below to create a new room listing</p>
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Basic Info ─────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Slug <span className="text-red-500">*</span></label>
              <input required value={form.slug} onChange={set("slug")} placeholder="deluxe-hilltop-suite" className={inputClass} />
              <p className="mt-1 text-xs text-gray-400">Used in the URL. Must be unique.</p>
            </div>
            <div>
              <label className={labelClass}>Room Number</label>
              <input value={form.roomNumber} onChange={set("roomNumber")} placeholder="101" className={inputClass} />
            </div>
            <div className="col-span-full">
              <label className={labelClass}>Room Name <span className="text-red-500">*</span></label>
              <input required value={form.name} onChange={set("name")} placeholder="Deluxe Hilltop Suite" className={inputClass} />
            </div>
            <div className="col-span-full">
              <label className={labelClass}>Mini Description <span className="text-gray-400 font-normal">(tagline shown on card)</span></label>
              <input value={form.miniDesc} onChange={set("miniDesc")} placeholder="Private Terrace with Pool / 300° View" className={inputClass} />
            </div>
            <div className="col-span-full">
              <label className={labelClass}>Full Description</label>
              <textarea rows={4} value={form.description} onChange={set("description")} placeholder="Write a detailed description of the room..." className={inputClass} />
            </div>
          </div>
        </div>

        {/* ── Details ────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Room Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Price / Night ($) <span className="text-red-500">*</span></label>
              <input required type="number" step="0.01" min="0" value={form.pricePerNight} onChange={set("pricePerNight")} placeholder="300" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Area (m²)</label>
              <input type="number" step="0.1" min="0" value={form.area} onChange={set("area")} placeholder="84" className={inputClass} />
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

        {/* ── Amenities ──────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Amenities & Inclusions</h2>
          <TagListInput
            label="Amenities"
            items={amenities}
            onChange={setAmenities}
            placeholder="e.g. Air Conditioner (press Enter or click Add)"
          />
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <TagListInput
              label="What's Included in This Room"
              items={includedItems}
              onChange={setIncludedItems}
              placeholder="e.g. Private balcony (press Enter or click Add)"
            />
          </div>
        </div>

        {/* ── Images ─────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Gallery Images</h2>
          <ImageUrlInput images={images} onChange={setImages} />
        </div>

        {/* ── Submit ─────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Link href="/rooms" className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-60 rounded-xl transition-colors shadow-sm"
          >
            {createMutation.isPending ? "Creating..." : "Create Room"}
          </button>
        </div>
      </form>
    </div>
  );
}
