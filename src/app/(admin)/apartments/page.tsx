"use client";
import React, { useState } from "react";
import {
  useApartmentsQuery,
  useCreateApartmentMutation,
  useUpdateApartmentMutation,
  useDeleteApartmentMutation,
  useUploadImageMutation,
  useAddApartmentImagesMutation,
  useDeleteApartmentImageMutation,
} from "../../../../services/roomsApi";

type Apartment = { id: string; slug: string; name: string; description?: string; miniDesc?: string; facilities?: string[]; address?: string; images: { id: string; url: string }[]; rooms: any[]; createdAt: string; };

const EMPTY = { slug: "", name: "", description: "", miniDesc: "", facilities: [], address: "" };

function ApartmentModal({ mode, apt, onClose }: { mode: "add" | "edit" | "view"; apt: Apartment | null; onClose: () => void }) {
  const [form, setForm] = useState(mode === "edit" && apt ? { slug: apt.slug, name: apt.name, description: apt.description || "", miniDesc: apt.miniDesc || "", address: apt.address || "" } : { slug: EMPTY.slug, name: EMPTY.name, description: EMPTY.description, miniDesc: EMPTY.miniDesc, address: EMPTY.address });
  const [facilities, setFacilities] = useState<string[]>(mode === "edit" && apt && apt.facilities ? apt.facilities : []);
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");

  const createMutation = useCreateApartmentMutation({ onSuccess: onClose, onError: (e: any) => setError(e.response?.data?.message || "Error") });
  const updateMutation = useUpdateApartmentMutation({ onSuccess: onClose, onError: (e: any) => setError(e.response?.data?.message || "Error") });
  const uploadMutation = useUploadImageMutation();
  const addImagesMutation = useAddApartmentImagesMutation();
  const deleteImageMutation = useDeleteApartmentImageMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (mode === "add") createMutation.mutate({ ...form, facilities, images });
    else if (mode === "edit" && apt) updateMutation.mutate({ id: apt.id, ...form, facilities });
  };

  const addImage = () => { 
    if (imageUrl.trim()) { 
      if (mode === "add") {
        setImages([...images, imageUrl.trim()]); 
      } else if (mode === "edit" && apt) {
        addImagesMutation.mutate({ id: apt.id, urls: [imageUrl.trim()] });
      }
      setImageUrl(""); 
    } 
  };

  if (mode === "view" && apt) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Apartment Details</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Name</p><p className="font-medium text-gray-900 dark:text-white">{apt.name}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Slug</p><code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{apt.slug}</code></div>
            <div className="col-span-2"><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tagline (Mini Desc)</p><p className="text-sm text-gray-700 dark:text-gray-300">{apt.miniDesc || "—"}</p></div>
            <div className="col-span-2"><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</p><p className="text-sm text-gray-700 dark:text-gray-300">{apt.address || "—"}</p></div>
            <div className="col-span-2"><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</p><p className="text-sm text-gray-700 dark:text-gray-300">{apt.description || "—"}</p></div>
            <div className="col-span-2"><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Facilities</p>
              <div className="flex flex-wrap gap-2">
                {apt.facilities && apt.facilities.length > 0 ? apt.facilities.map((f, i) => (
                  <span key={i} className="px-2 py-1 text-xs bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 rounded-md border border-brand-200 dark:border-brand-800">{f}</span>
                )) : <span className="text-sm text-gray-500">—</span>}
              </div>
            </div>
          </div>
          {apt.images.length > 0 && (
            <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Images ({apt.images.length})</p>
              <div className="grid grid-cols-3 gap-2">{apt.images.map((img) => (<div key={img.id} className="relative aspect-video overflow-hidden rounded-lg bg-gray-100"><img src={img.url} alt="" className="w-full h-full object-cover" /></div>))}</div>
            </div>
          )}
          <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rooms</p><p className="font-medium text-gray-900 dark:text-white">{apt.rooms.length} room(s)</p></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{mode === "add" ? "Add Apartment" : "Edit Apartment"}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Slug <span className="text-red-500">*</span></label>
            <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="deluxe-hilltop" className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name <span className="text-red-500">*</span></label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Deluxe Hilltop Residence" className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tagline (Mini Desc)</label>
            <input value={form.miniDesc} onChange={(e) => setForm({ ...form, miniDesc: e.target.value })} placeholder="Private Terrace with Pool / 300° View" className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Address</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="No. 12, Hill Street" className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Facilities</label>
            <div className="flex gap-2 mb-2">
              <input id="facInput" placeholder="e.g. WiFi, Pool (press Add)" className="flex-1 px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = e.currentTarget.value.trim();
                  if (val && !facilities.includes(val)) { setFacilities([...facilities, val]); e.currentTarget.value = ""; }
                }
              }} />
              <button type="button" onClick={() => {
                const input = document.getElementById("facInput") as HTMLInputElement;
                const val = input.value.trim();
                if (val && !facilities.includes(val)) { setFacilities([...facilities, val]); input.value = ""; }
              }} className="px-3 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl">Add</button>
            </div>
            {facilities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {facilities.map((f, i) => (
                  <span key={i} className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md border border-gray-200 dark:border-gray-700">
                    {f}
                    <button type="button" onClick={() => setFacilities(facilities.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500 ml-1">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Gallery Images</label>
            <div className="flex gap-2 mb-3">
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} onKeyDown={(e) => { if(e.key==='Enter'){e.preventDefault();addImage();} }} placeholder="https://res.cloudinary.com/... or upload image" className="flex-1 px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <button type="button" onClick={addImage} disabled={addImagesMutation.isPending} className="px-4 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-60 rounded-xl transition-colors">Add</button>
              <div className="relative">
                <input type="file" accept="image/*" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const formData = new FormData();
                    formData.append("file", file);
                    uploadMutation.mutate(formData, {
                      onSuccess: (data: any) => {
                        if (data.url) {
                          if (mode === "add") {
                            setImages(prev => [...prev, data.url]);
                          } else if (mode === "edit" && apt) {
                            addImagesMutation.mutate({ id: apt.id, urls: [data.url] });
                          }
                        }
                      },
                      onError: (err: any) => alert("Failed to upload image: " + (err.response?.data?.message || err.message))
                    });
                    e.target.value = "";
                  }
                }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploadMutation.isPending || addImagesMutation.isPending} />
                <button type="button" className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2">
                  {uploadMutation.isPending || addImagesMutation.isPending ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  )}
                  Upload File
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mode === "add" && images.map((url, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video bg-gray-100 dark:bg-gray-800">
                  <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="p-1.5 bg-red-500 text-white rounded-lg"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                  <p className="absolute bottom-0 left-0 right-0 px-2 py-1 text-[10px] text-white bg-black/60 truncate">{url}</p>
                </div>
              ))}
              {mode === "edit" && apt && apt.images.map((img) => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video bg-gray-100 dark:bg-gray-800">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => {
                      if(window.confirm("Delete this image?")) { deleteImageMutation.mutate({ id: apt.id, imageId: img.id }); }
                    }} className="p-1.5 bg-red-500 text-white rounded-lg" disabled={deleteImageMutation.isPending}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-60 rounded-xl transition-colors">
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : mode === "add" ? "Create" : "Save"}
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
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30"><svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></div>
        <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-white mb-1">Delete Apartment</h3>
        <p className="text-center text-sm text-gray-500 mb-6">Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-white">"{name}"</span>?</p>
        <div className="flex gap-3"><button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-xl transition-colors">{isLoading ? "Deleting..." : "Delete"}</button></div>
      </div>
    </div>
  );
}

export default function ApartmentsPage() {
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useApartmentsQuery();
  const deleteMutation = useDeleteApartmentMutation({ onSuccess: () => setDeleteTargetId(null) });

  const apartments: Apartment[] = data?.apartments ?? [];
  const selected = apartments.find(a => a.id === selectedId) || null;
  const deleteTarget = apartments.find(a => a.id === deleteTargetId) || null;
  const filtered = apartments.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.slug.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Apartments</h1><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage apartment properties</p></div>
        <button onClick={() => { setSelectedId(null); setModalMode("add"); }} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Add Apartment</button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative max-w-xs"><svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search apartments..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (<div className="flex items-center justify-center py-16 text-gray-400"><svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Loading...</div>)
          : error ? (<div className="flex items-center justify-center py-16 text-red-500 text-sm">Failed to load apartments.</div>)
          : (
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rooms</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Images</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.length === 0 ? (<tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">No apartments found.</td></tr>)
                : filtered.map((apt, i) => (
                  <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                    <td className="px-6 py-4"><span className="font-medium text-gray-900 dark:text-white">{apt.name}</span><p className="text-xs text-gray-400 mt-0.5">{apt.address || "No address"}</p></td>
                    <td className="px-6 py-4"><code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">{apt.slug}</code></td>
                    <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{apt.rooms.length} rooms</span></td>
                    <td className="px-6 py-4 text-gray-500">{apt.images.length} photo(s)</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setSelectedId(apt.id); setModalMode("view"); }} title="View" className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                        <button onClick={() => { setSelectedId(apt.id); setModalMode("edit"); }} title="Edit" className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                        <button onClick={() => setDeleteTargetId(apt.id)} title="Delete" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!isLoading && !error && (<div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">Showing {filtered.length} of {apartments.length} apartments</div>)}
      </div>

      {modalMode && <ApartmentModal mode={modalMode} apt={selected} onClose={() => { setModalMode(null); setSelectedId(null); }} />}
      {deleteTarget && <DeleteModal name={deleteTarget.name} onClose={() => setDeleteTargetId(null)} onConfirm={() => deleteMutation.mutate(deleteTarget.id)} isLoading={deleteMutation.isPending} />}
    </div>
  );
}
