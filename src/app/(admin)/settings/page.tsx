"use client";

import React, { useState, useEffect } from "react";
import { useSettingsQuery, useUpdateSettingsMutation } from "../../../../services/settingsApi";

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
      <span>{type === "success" ? "✓" : "✕"}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}

export default function SettingsPage() {
  const { data, isLoading } = useSettingsQuery();
  const updateMutation = useUpdateSettingsMutation();
  
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Populate form when data loads
  useEffect(() => {
    if (data?.settings) {
      setFormData(data.settings);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData, {
      onSuccess: () => setToast({ message: "Settings saved successfully", type: "success" }),
      onError: () => setToast({ message: "Failed to save settings", type: "error" }),
    });
  };

  if (isLoading) {
    return <div className="p-6 text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage hotel information, taxes, and policies</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hotel Name</label>
              <input
                type="text"
                name="hotelName"
                value={formData.hotelName || ""}
                onChange={handleChange}
                placeholder="e.g. PinkLotus Hotel"
                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail || ""}
                onChange={handleChange}
                placeholder="info@pinklotus.com"
                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
              <input
                type="text"
                name="contactPhone"
                value={formData.contactPhone || ""}
                onChange={handleChange}
                placeholder="+94 77 123 4567"
                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                placeholder="123 Lotus Road, Colombo"
                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tax / VAT Rate (%)</label>
              <input
                type="number"
                step="0.01"
                name="taxRate"
                value={formData.taxRate || ""}
                onChange={handleChange}
                placeholder="e.g. 18"
                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency Symbol</label>
              <input
                type="text"
                name="currencySymbol"
                value={formData.currencySymbol || "$"}
                onChange={handleChange}
                placeholder="e.g. LKR or $"
                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Standard Check-in Time</label>
              <input
                type="time"
                name="checkInTime"
                value={formData.checkInTime || "14:00"}
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Standard Check-out Time</label>
              <input
                type="time"
                name="checkOutTime"
                value={formData.checkOutTime || "11:00"}
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cancellation Policy</label>
              <textarea
                name="cancellationPolicy"
                value={formData.cancellationPolicy || ""}
                onChange={handleChange}
                rows={4}
                placeholder="Free cancellation up to 48 hours before check-in..."
                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={true} // Disabled per user request
            className="px-6 py-3 text-sm font-semibold text-white bg-gray-400 cursor-not-allowed rounded-xl transition-colors"
          >
            Save Settings (Disabled)
          </button>
        </div>
      </form>
    </div>
  );
}
