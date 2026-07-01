"use client";

import React, { useState } from "react";
import {
  useCustomersQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from "../../../../services/userApi";

type CustomerStatus = "ACTIVE" | "INACTIVE" | "BLACKLISTED";

type Customer = {
  id: string;
  fullname: string;
  email: string;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
};

// ── Status Badge ───────────────────────────────────────────────
function StatusBadge({ status }: { status: CustomerStatus }) {
  const map: Record<CustomerStatus, { bg: string; dot: string; label: string }> = {
    ACTIVE: {
      bg: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      dot: "bg-green-500",
      label: "Active",
    },
    INACTIVE: {
      bg: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      dot: "bg-gray-400",
      label: "Inactive",
    },
    BLACKLISTED: {
      bg: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      dot: "bg-red-500",
      label: "Blacklisted",
    },
  };
  const s = map[status] ?? map.INACTIVE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ── Edit Modal ─────────────────────────────────────────────────
function EditModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const [form, setForm] = useState({
    fullname: customer.fullname,
    email: customer.email,
    status: customer.status,
  });
  const [error, setError] = useState("");

  const updateMutation = useUpdateCustomerMutation({
    onSuccess: () => onClose(),
    onError: (err: any) => setError(err.response?.data?.message || "Something went wrong."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    updateMutation.mutate({ id: customer.id, ...form });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Customer</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={form.fullname}
                onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as CustomerStatus })}
                className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="BLACKLISTED">Blacklisted</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={updateMutation.isPending} className="px-4 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-60 rounded-xl transition-colors">
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── View Modal ─────────────────────────────────────────────────
function ViewModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Details</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Full Name</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.fullname}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Email</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Status</p>
              <StatusBadge status={customer.status} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Registered</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{new Date(customer.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Last Updated</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{new Date(customer.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ─────────────────────────────────────────────
function DeleteModal({ customer, onConfirm, onClose, isLoading }: { customer: Customer; onConfirm: () => void; onClose: () => void; isLoading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-white mb-1">Delete Customer</h3>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-white">{customer.fullname}</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-xl transition-colors">
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function CustomersPage() {
  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [viewTarget, setViewTarget] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data, isLoading, error } = useCustomersQuery();
  const deleteMutation = useDeleteCustomerMutation({
    onSuccess: () => setDeleteTarget(null),
  });

  const customers: Customer[] = data?.customers ?? [];
  const filtered = customers.filter((c) => {
    const matchSearch =
      c.fullname.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    ALL: customers.length,
    ACTIVE: customers.filter((c) => c.status === "ACTIVE").length,
    INACTIVE: customers.filter((c) => c.status === "INACTIVE").length,
    BLACKLISTED: customers.filter((c) => c.status === "BLACKLISTED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage registered customer accounts</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["ALL", "ACTIVE", "INACTIVE", "BLACKLISTED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-xl px-4 py-3 text-left border transition-all ${
              statusFilter === s
                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-brand-300"
            }`}
          >
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{counts[s]}</p>
            <p className={`text-xs font-medium mt-0.5 ${statusFilter === s ? "text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400"}`}>
              {s === "ALL" ? "Total" : s.charAt(0) + s.slice(1).toLowerCase()}
            </p>
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 dark:text-gray-500">
              <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading customers...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-red-500 text-sm">Failed to load customers.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registered</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400 dark:text-gray-500">No customers found.</td>
                  </tr>
                ) : (
                  filtered.map((customer, idx) => (
                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4 text-gray-400 dark:text-gray-500">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {customer.fullname.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{customer.fullname}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{customer.email}</td>
                      <td className="px-6 py-4"><StatusBadge status={customer.status} /></td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">{new Date(customer.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setViewTarget(customer)} title="View" className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button onClick={() => setEditTarget(customer)} title="Edit" className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => setDeleteTarget(customer)} title="Delete" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {!isLoading && !error && (
          <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
            Showing {filtered.length} of {customers.length} customers
          </div>
        )}
      </div>

      {/* Modals */}
      {editTarget && <EditModal customer={editTarget} onClose={() => setEditTarget(null)} />}
      {viewTarget && <ViewModal customer={viewTarget} onClose={() => setViewTarget(null)} />}
      {deleteTarget && (
        <DeleteModal
          customer={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
