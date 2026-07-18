"use client";

import React, { useState } from "react";
import {
  useOnlineBookingsQuery,
  useUpdateBookingMutation,
} from "../../../../services/bookingsApi";
import { useRoomsQuery } from "../../../../services/roomsApi";
import DatePicker from "@/components/form/date-picker";

type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "NO_SHOW";

type Booking = {
  id: string;
  bookingCode: string;
  customer: { id: string; fullname: string; email: string; phone?: string };
  room: { id: string; name: string; roomNumber: string | null; pricePerNight: string };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: string;
  status: BookingStatus;
  createdAt: string;
  specialRequest: string | null;
};

// ── Toast ──────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  React.useEffect(() => {
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

// ── Status Badge ───────────────────────────────────────────────
function StatusBadge({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, { bg: string; dot: string; label: string }> = {
    PENDING: { bg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", dot: "bg-yellow-500", label: "Pending" },
    CONFIRMED: { bg: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", dot: "bg-green-500", label: "Confirmed" },
    CHECKED_IN: { bg: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", dot: "bg-blue-500", label: "Checked In" },
    CHECKED_OUT: { bg: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400", dot: "bg-gray-500", label: "Checked Out" },
    CANCELLED: { bg: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", dot: "bg-red-500", label: "Cancelled" },
    NO_SHOW: { bg: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", dot: "bg-orange-500", label: "No Show" },
  };
  const s = map[status] ?? map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ── Status Action Buttons ──────────────────────────────────────
function StatusActions({ booking, onAction }: { booking: Booking; onAction: (status: BookingStatus) => void }) {
  const s = booking.status;
  return (
    <div className="flex items-center justify-end gap-1.5">
      {s === "PENDING" && (
        <>
          <button onClick={() => onAction("CONFIRMED")} className="px-2.5 py-1 text-[11px] font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors">Confirm</button>
          <button onClick={() => onAction("CANCELLED")} className="px-2.5 py-1 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Cancel</button>
        </>
      )}
      {s === "CONFIRMED" && (
        <>
          <button onClick={() => onAction("CHECKED_IN")} className="px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">Check In</button>
          <button onClick={() => onAction("NO_SHOW")} className="px-2.5 py-1 text-[11px] font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">No Show</button>
        </>
      )}
      {s === "CHECKED_IN" && (
        <button onClick={() => onAction("CHECKED_OUT")} className="px-2.5 py-1 text-[11px] font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors">Check Out</button>
      )}
    </div>
  );
}

// ── Booking Detail Slide-over ──────────────────────────────────
function BookingSlideOver({ booking, onClose, onAction, isUpdating }: { booking: Booking; onClose: () => void; onAction: (status: BookingStatus) => void; isUpdating: boolean }) {
  const nights = Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24));
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Booking Details</h2>
            <p className="text-xs text-brand-500 font-mono">{booking.bookingCode}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-5 space-y-5">
          {/* Status */}
          <div className="flex items-center justify-between">
            <StatusBadge status={booking.status} />
            <span className="text-xs text-gray-400">Created {new Date(booking.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Customer */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Customer</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">{booking.customer.fullname.charAt(0)}</div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{booking.customer.fullname}</p>
                <p className="text-xs text-gray-500">{booking.customer.email}</p>
                {booking.customer.phone && <p className="text-xs text-gray-500">📞 {booking.customer.phone}</p>}
              </div>
            </div>
          </div>

          {/* Room & Dates */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Stay Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-gray-400 uppercase">Room</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{booking.room.name}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase">Guests</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{booking.guests}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase">Check-in</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(booking.checkIn).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase">Check-out</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(booking.checkOut).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase">Nights</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{nights}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase">Total</p>
                <p className="text-sm font-bold text-brand-600">${booking.totalAmount}</p>
              </div>
            </div>
          </div>

          {/* Special Request */}
          {booking.specialRequest && (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
              <h4 className="text-[11px] font-bold text-yellow-600 uppercase tracking-wider mb-2">Special Request</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{booking.specialRequest}</p>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Booking Flow</h4>
            <div className="space-y-2">
              {(["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] as BookingStatus[]).map((step, i) => {
                const statusOrder = ["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT"];
                const currentIdx = statusOrder.indexOf(booking.status);
                const stepIdx = statusOrder.indexOf(step);
                const isCancelled = booking.status === "CANCELLED" || booking.status === "NO_SHOW";
                const isDone = !isCancelled && stepIdx <= currentIdx;
                const isCurrent = !isCancelled && stepIdx === currentIdx;
                return (
                  <div key={step} className={`flex items-center gap-3 p-2 rounded-lg ${isCurrent ? "bg-brand-50 dark:bg-brand-900/10" : ""}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isDone ? "bg-brand-500 text-white" : "bg-gray-200 text-gray-400 dark:bg-gray-700"}`}>
                      {isDone ? "✓" : i + 1}
                    </div>
                    <span className={`text-sm ${isDone ? "text-gray-900 dark:text-white font-medium" : "text-gray-400"}`}>{step.replace("_", " ")}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            {booking.status === "PENDING" && (
              <>
                <button disabled={isUpdating} onClick={() => onAction("CONFIRMED")} className="w-full py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl disabled:opacity-50 transition-colors">{isUpdating ? "Processing..." : "✓ Confirm Booking"}</button>
                <button disabled={isUpdating} onClick={() => onAction("CANCELLED")} className="w-full py-3 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl disabled:opacity-50 transition-colors">Cancel Booking</button>
              </>
            )}
            {booking.status === "CONFIRMED" && (
              <>
                <button disabled={isUpdating} onClick={() => onAction("CHECKED_IN")} className="w-full py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 transition-colors">{isUpdating ? "Processing..." : "Check In Guest"}</button>
                <button disabled={isUpdating} onClick={() => onAction("NO_SHOW")} className="w-full py-3 text-sm font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl disabled:opacity-50 transition-colors">Mark as No Show</button>
              </>
            )}
            {booking.status === "CHECKED_IN" && (
              <button disabled={isUpdating} onClick={() => onAction("CHECKED_OUT")} className="w-full py-3 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl disabled:opacity-50 transition-colors">{isUpdating ? "Processing..." : "Check Out Guest"}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function OnlineBookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [roomIdFilter, setRoomIdFilter] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  React.useEffect(() => {
    setPage(1);
  }, [statusFilter, dateFrom, dateTo, roomIdFilter]);

  const { data: roomsData } = useRoomsQuery();
  const { data, isLoading, error } = useOnlineBookingsQuery({
    page,
    limit: 20,
    search: debouncedSearch,
    status: statusFilter,
    from: dateFrom,
    to: dateTo,
    roomId: roomIdFilter,
  });

  const updateMutation = useUpdateBookingMutation();

  const handleStatusAction = (bookingId: string, newStatus: BookingStatus) => {
    updateMutation.mutate({ id: bookingId, status: newStatus }, {
      onSuccess: () => {
        setToast({ message: `Booking updated to ${newStatus.replace("_", " ")}`, type: "success" });
        setSelectedBooking(null);
      },
      onError: (err: any) => setToast({ message: err?.response?.data?.message || "Update failed", type: "error" }),
    });
  };

  const bookings: Booking[] = data?.bookings ?? [];
  const counts = data?.counts ?? { ALL: 0, PENDING: 0, CONFIRMED: 0, CHECKED_IN: 0, CANCELLED: 0 };
  const totalItems = data?.total ?? 0;
  const totalPages = Math.ceil(totalItems / 20);

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Online Bookings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage booking requests from the website</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(["ALL", "PENDING", "CONFIRMED", "CHECKED_IN", "CANCELLED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-xl px-4 py-3 text-left border transition-all ${
              statusFilter === s
                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-brand-300"
            }`}
          >
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{counts[s] || 0}</p>
            <p className={`text-xs font-medium mt-0.5 ${statusFilter === s ? "text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400"}`}>
              {s === "ALL" ? "Total" : s.replace("_", " ").charAt(0) + s.replace("_", " ").slice(1).toLowerCase()}
            </p>
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        {/* Search + Filters */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
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
          
          <div className="w-48">
            <select
              className="w-full py-2 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
              value={roomIdFilter}
              onChange={(e) => setRoomIdFilter(e.target.value)}
            >
              <option value="">All Rooms</option>
              {roomsData?.rooms?.map((r: any) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm">
            <div className="w-40 relative z-50">
              <DatePicker
                id="dateFrom"
                placeholder="From Date"
                onChange={(_, dateStr) => setDateFrom(dateStr as string)}
              />
            </div>
            <div className="w-40 relative z-50">
              <DatePicker
                id="dateTo"
                placeholder="To Date"
                onChange={(_, dateStr) => setDateTo(dateStr as string)}
              />
            </div>
            {(dateFrom || dateTo || roomIdFilter || search) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); setRoomIdFilter(""); setSearch(""); }} className="text-xs text-brand-500 hover:underline">Clear</button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 dark:text-gray-500">Loading bookings...</div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-red-500 text-sm">Failed to load bookings.</div>
          ) : (
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Booking</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400 dark:text-gray-500">No bookings found.</td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id} onClick={() => setSelectedBooking(booking)} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer">
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
                        <div className="text-xs text-gray-500">→ {new Date(booking.checkOut).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">${booking.totalAmount}</td>
                      <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <StatusActions booking={booking} onAction={(s) => handleStatusAction(booking.id, s)} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer with Pagination */}
        {!isLoading && !error && (
          <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <div>
              Showing {bookings.length} of {totalItems} bookings
            </div>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Detail Slide-over */}
      {selectedBooking && (
        <BookingSlideOver
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onAction={(s) => handleStatusAction(selectedBooking.id, s)}
          isUpdating={updateMutation.isPending}
        />
      )}
    </div>
  );
}
