"use client";
import React, { useState } from "react";
import {
  useRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} from "../../../../services/roomsApi";
import { useApartmentsQuery } from "../../../../services/roomsApi";

type Room = { id: string; slug: string; roomNumber?: string; name: string; miniDesc?: string; description?: string; pricePerNight: number; area?: number; maxGuests: number; bedType?: string; amenities: string[]; includedItems: string[]; status: string; images: { id: string; url: string }[]; apartment?: { id: string; name: string; slug: string } | null; createdAt: string; };

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  OCCUPIED: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  MAINTENANCE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const EMPTY_FORM = { slug: "", roomNumber: "", name: "", miniDesc: "", description: "", pricePerNight: "", area: "", maxGuests: "2", bedType: "", amenities: "", includedItems: "", status: "AVAILABLE", apartmentId: "" };

function RoomModal({ mode, room, apartments, onClose }: { mode: "add" | "edit" | "view"; room: Room | null; apartments: any[]; onClose: () => void }) {
  const [form, setForm] = useState(mode === "edit" && room ? {
    slug: room.slug, roomNumber: room.roomNumber || "", name: room.name, miniDesc: room.miniDesc || "",
    description: room.description || "", pricePerNight: String(room.pricePerNight), area: String(room.area || ""),
    maxGuests: String(room.maxGuests), bedType: room.bedType || "", amenities: room.amenities.join(", "),
    includedItems: room.includedItems.join(", "), status: room.status, apartmentId: room.apartment?.id || "",
  } : EMPTY_FORM);
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");

  const createMutation = useCreateRoomMutation({ onSuccess: onClose, onError: (e: any) => setError(e.response?.data?.message || "Error") });
  const updateMutation = useUpdateRoomMutation({ onSuccess: onClose, onError: (e: any) => setError(e.response?.data?.message || "Error") });

  const buildPayload = () => ({
    ...form,
    pricePerNight: parseFloat(form.pricePerNight),
    area: form.area ? parseFloat(form.area) : undefined,
    maxGuests: parseInt(form.maxGuests),
    amenities: form.amenities ? form.amenities.split(",").map((s) => s.trim()).filter(Boolean) : [],
    includedItems: form.includedItems ? form.includedItems.split(",").map((s) => s.trim()).filter(Boolean) : [],
    apartmentId: form.apartmentId || null,
    images: mode === "add" ? images : undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (mode === "add") createMutation.mutate(buildPayload());
    else if (mode === "edit" && room) updateMutation.mutate({ id: room.id, ...buildPayload() });
  };

  const addImage = () => { if (imageUrl.trim()) { setImages([...images, imageUrl.trim()]); setImageUrl(""); } };

  if (mode === "view" && room) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Room Details</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Name</p><p className="font-medium text-gray-900 dark:text-white">{room.name}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Room No.</p><p className="font-medium text-gray-900 dark:text-white">{room.roomNumber || "—"}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Slug</p><code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{room.slug}</code></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[room.status]}`}>{room.status}</span></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Price/Night</p><p className="font-semibold text-gray-900 dark:text-white">${room.pricePerNight}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Area</p><p className="text-gray-700 dark:text-gray-300">{room.area ? `${room.area} m²` : "—"}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Max Guests</p><p className="text-gray-700 dark:text-gray-300">{room.maxGuests}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Bed Type</p><p className="text-gray-700 dark:text-gray-300">{room.bedType || "—"}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Apartment</p><p className="text-gray-700 dark:text-gray-300">{room.apartment?.name || "Standalone"}</p></div>
            <div className="col-span-2"><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mini Desc</p><p className="text-sm text-gray-700 dark:text-gray-300">{room.miniDesc || "—"}</p></div>
          </div>
          {room.amenities.length > 0 && (<div><p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Amenities</p><div className="flex flex-wrap gap-1.5">{room.amenities.map((a, i) => (<span key={i} className="px-2 py-0.5 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 rounded text-xs">{a}</span>))}</div></div>)}
          {room.images.length > 0 && (<div><p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Images ({room.images.length})</p><div className="grid grid-cols-3 gap-2">{room.images.map((img) => (<div key={img.id} className="relative aspect-video overflow-hidden rounded-lg bg-gray-100"><img src={img.url} alt="" className="w-full h-full object-cover" /></div>))}</div></div>)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{mode === "add" ? "Add Room" : "Edit Room"}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Slug <span className="text-red-500">*</span></label><input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="deluxe-room-101" className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Room Number</label><input value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} placeholder="101" className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name <span className="text-red-500">*</span></label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Deluxe Hilltop Suite" className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price/Night ($) <span className="text-red-500">*</span></label><input required type="number" step="0.01" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} placeholder="300" className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Area (m²)</label><input type="number" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="84" className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Guests</label><input type="number" value={form.maxGuests} onChange={(e) => setForm({ ...form, maxGuests: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bed Type</label><input value={form.bedType} onChange={(e) => setForm({ ...form, bedType: e.target.value })} placeholder="1 King Bed" className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="AVAILABLE">Available</option><option value="OCCUPIED">Occupied</option><option value="MAINTENANCE">Maintenance</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Apartment</label>
              <select value={form.apartmentId} onChange={(e) => setForm({ ...form, apartmentId: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Standalone</option>{apartments.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
              </select></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mini Description</label><input value={form.miniDesc} onChange={(e) => setForm({ ...form, miniDesc: e.target.value })} placeholder="Private Terrace with Pool" className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amenities <span className="text-gray-400 font-normal">(comma separated)</span></label><input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="Air Conditioner, WiFi, TV" className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Included Items <span className="text-gray-400 font-normal">(comma separated)</span></label><input value={form.includedItems} onChange={(e) => setForm({ ...form, includedItems: e.target.value })} placeholder="Private balcony, King bed, Coffee machine" className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
          </div>
          {mode === "add" && (
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Images (URLs)</label>
              <div className="flex gap-2 mb-2"><input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="flex-1 px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <button type="button" onClick={addImage} className="px-3 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl">Add</button></div>
              {images.map((u, i) => (<p key={i} className="text-xs text-gray-500 truncate">{u}</p>))}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-60 rounded-xl transition-colors">
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : mode === "add" ? "Create Room" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ name, onConfirm, onClose, isLoading }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100"><svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></div>
        <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-white mb-1">Delete Room</h3>
        <p className="text-center text-sm text-gray-500 mb-6">Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-white">"{name}"</span>?</p>
        <div className="flex gap-3"><button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-xl transition-colors">{isLoading ? "Deleting..." : "Delete"}</button></div>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | null>(null);
  const [selected, setSelected] = useState<Room | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data, isLoading, error } = useRoomsQuery();
  const { data: aptData } = useApartmentsQuery();
  const deleteMutation = useDeleteRoomMutation({ onSuccess: () => setDeleteTarget(null) });

  const rooms: Room[] = data?.rooms ?? [];
  const apartments = aptData?.apartments ?? [];
  const filtered = rooms.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rooms</h1><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage individual room listings</p></div>
        <button onClick={() => { setSelected(null); setModalMode("add"); }} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Add Room</button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "AVAILABLE", "OCCUPIED", "MAINTENANCE"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${statusFilter === s ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
            {s === "ALL" ? `All (${rooms.length})` : `${s.charAt(0) + s.slice(1).toLowerCase()} (${rooms.filter((r) => r.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative max-w-xs"><svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search rooms..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (<div className="flex items-center justify-center py-16 text-gray-400"><svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Loading...</div>)
          : error ? (<div className="flex items-center justify-center py-16 text-red-500 text-sm">Failed to load rooms.</div>)
          : (
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Apartment</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.length === 0 ? (<tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">No rooms found.</td></tr>)
                : filtered.map((room, i) => (
                  <tr key={room.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {room.images[0] ? (<img src={room.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />) : (<div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0"><svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg></div>)}
                        <div><p className="font-medium text-gray-900 dark:text-white">{room.name}</p><p className="text-xs text-gray-400">{room.roomNumber ? `#${room.roomNumber}` : ""} {room.miniDesc || ""}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">{room.slug}</code></td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">${room.pricePerNight}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">{room.apartment?.name || <span className="italic text-gray-400">Standalone</span>}</td>
                    <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[room.status]}`}>{room.status}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setSelected(room); setModalMode("view"); }} title="View" className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                        <button onClick={() => { setSelected(room); setModalMode("edit"); }} title="Edit" className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                        <button onClick={() => setDeleteTarget(room)} title="Delete" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!isLoading && !error && (<div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">Showing {filtered.length} of {rooms.length} rooms</div>)}
      </div>

      {modalMode && <RoomModal mode={modalMode} room={selected} apartments={apartments} onClose={() => { setModalMode(null); setSelected(null); }} />}
      {deleteTarget && <DeleteModal name={deleteTarget.name} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget.id)} isLoading={deleteMutation.isPending} />}
    </div>
  );
}
