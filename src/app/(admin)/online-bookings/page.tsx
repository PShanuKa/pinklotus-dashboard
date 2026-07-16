"use client";

import React, { useState } from "react";
import {
  useOnlineBookingsQuery,
  useUpdateBookingMutation,
} from "../../../../services/bookingsApi";

type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "NO_SHOW";

type Booking = {
  id: string;
  bookingCode: string;
  customer: { id: string; fullname: string; email: string };
  room: { id: string; name: string; roomNumber: string | null; pricePerNight: string };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: string;
  status: BookingStatus;
  createdAt: string;
  specialRequest: string | null;
};

// ── Status Badge ───────────────────────────────────────────────
function StatusBadge({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, { bg: string; dot: string; label: string }> = {
    PENDING: { bg: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-500", label: "Pending" },
    CONFIRMED: { bg: "bg-green-100 text-green-800", dot: "bg-green-500", label: "Confirmed" },
    CHECKED_IN: { bg: "bg-blue-100 text-blue-800", dot: "bg-blue-500", label: "Checked In" },
    CHECKED_OUT: { bg: "bg-gray-100 text-gray-800", dot: "bg-gray-500", label: "Checked Out" },
    CANCELLED: { bg: "bg-red-100 text-red-800", dot: "bg-red-500", label: "Cancelled" },
    NO_SHOW: { bg: "bg-orange-100 text-orange-800", dot: "bg-orange-500", label: "No Show" },
  };
  const s = map[status] ?? map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ── Update Confirm ─────────────────────────────────────────────
function UpdateStatusModal({ booking, newStatus, onConfirm, onClose, isLoading }: { booking: Booking; newStatus: BookingStatus; onConfirm: () => void; onClose: () => void; isLoading: boolean }) {
  const isCancel = newStatus === "CANCELLED";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full ${isCancel ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isCancel ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            )}
          </svg>
        </div>
        <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {isCancel ? "Cancel Booking" : "Confirm Booking"}
        </h3>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          Are you sure you want to mark <span className="font-medium text-gray-900 dark:text-white">{booking.bookingCode}</span> as {newStatus}?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-xl transition-colors">Close</button>
          <button onClick={onConfirm} disabled={isLoading} className={`flex-1 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60 rounded-xl transition-colors ${isCancel ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}>
            {isLoading ? "Updating..." : "Yes, Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function OnlineBookingsPage() {
  const [updateTarget, setUpdateTarget] = useState<{ booking: Booking; newStatus: BookingStatus } | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data, isLoading, error } = useOnlineBookingsQuery();
  const updateMutation = useUpdateBookingMutation({
    onSuccess: () => setUpdateTarget(null),
  });

  const bookings: Booking[] = data?.bookings ?? [];
  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.fullname.toLowerCase().includes(search.toLowerCase()) ||
      b.room.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    ALL: bookings.length,
    PENDING: bookings.filter((b) => b.status === "PENDING").length,
    CONFIRMED: bookings.filter((b) => b.status === "CONFIRMED").length,
    CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Online Bookings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage booking requests from the website</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["ALL", "PENDING", "CONFIRMED", "CANCELLED"] as const).map((s) => (
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
              placeholder="Search bookings..."
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
              Loading bookings...
            </div>
          ) : error ? (
             <div className="flex items-center justify-center py-16 text-red-500 text-sm">Failed to load bookings.</div>
          ) : (
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Booking Code</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400 dark:text-gray-500">No bookings found.</td>
                  </tr>
                ) : (
                  filtered.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-brand-600 dark:text-brand-400">{booking.bookingCode}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{booking.customer.fullname}</div>
                        <div className="text-xs text-gray-500">{booking.customer.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{booking.room.name}</div>
                        <div className="text-xs text-gray-500">{booking.guests} Guests</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 dark:text-white">{new Date(booking.checkIn).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">to {new Date(booking.checkOut).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">${booking.totalAmount}</td>
                      <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                      <td className="px-6 py-4 text-right">
                        {booking.status === "PENDING" && (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setUpdateTarget({ booking, newStatus: "CONFIRMED" })} className="px-3 py-1.5 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors">Confirm</button>
                            <button onClick={() => setUpdateTarget({ booking, newStatus: "CANCELLED" })} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Cancel</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {updateTarget && (
        <UpdateStatusModal
          booking={updateTarget.booking}
          newStatus={updateTarget.newStatus}
          onClose={() => setUpdateTarget(null)}
          onConfirm={() => updateMutation.mutate({ id: updateTarget.booking.id, status: updateTarget.newStatus })}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}
