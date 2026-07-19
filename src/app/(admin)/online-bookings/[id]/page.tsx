"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBookingQuery, useUpdateBookingMutation } from "../../../../../services/bookingsApi";
import { useBookingPaymentsQuery, useRecordPaymentMutation } from "../../../../../services/paymentsApi";

type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "NO_SHOW";
type BookingSource = "ONLINE" | "DASHBOARD";

type Booking = {
  id: string;
  bookingCode: string;
  customer: { id: string; fullname: string; email: string; phone?: string };
  room?: { id: string; name: string; roomNumber: string | null; pricePerNight: string };
  apartment?: { id: string; name: string; slug: string; rooms?: any[] };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: string;
  status: BookingStatus;
  source: BookingSource;
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

// ── Source Badge ────────────────────────────────────
function SourceBadge({ source }: { source: BookingSource }) {
  if (source === "ONLINE") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        🌐 Online
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
      🏨 Walk-in
    </span>
  );
}

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

// ── Booking Payments Section ─────────────────────────────────────
function BookingPaymentsSection({ booking }: { booking: Booking }) {
  const { data, isLoading } = useBookingPaymentsQuery(booking.id);
  const recordMutation = useRecordPaymentMutation();
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    setIsSubmitting(true);
    recordMutation.mutate(
      { bookingId: booking.id, amount: Number(amount), method },
      {
        onSuccess: () => {
          setShowForm(false);
          setAmount("");
          setIsSubmitting(false);
        },
        onError: () => setIsSubmitting(false),
      }
    );
  };

  if (isLoading) return <div className="text-sm text-gray-500">Loading payments...</div>;

  const payments = data?.booking?.payments || [];
  const paid = data?.paid || 0;
  const outstanding = data?.outstanding || 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Payments</h4>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          {showForm ? "Cancel" : "+ Add Payment"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-[11px] text-green-700 uppercase mb-1">Paid</p>
          <p className="text-lg font-bold text-green-700">${paid}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <p className="text-[11px] text-red-700 uppercase mb-1">Outstanding</p>
          <p className="text-lg font-bold text-red-600">${outstanding}</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleRecord} className="mb-5 space-y-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white"
            >
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-50 mt-2"
          >
            {isSubmitting ? "Saving..." : "Record Payment"}
          </button>
        </form>
      )}

      {payments.length > 0 ? (
        <div className="space-y-3">
          {payments.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-900">${p.amount}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.method.replace("_", " ")} • {new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${p.status === "SUCCESS" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">No payments recorded yet.</p>
      )}
    </div>
  );
}


export default function BookingDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const { data, isLoading, error } = useBookingQuery(id);
  const updateMutation = useUpdateBookingMutation();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  if (isLoading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading booking details...</div>;
  if (error || !data?.booking) return <div className="p-8 text-center text-red-500">Failed to load booking.</div>;

  const booking: Booking = data.booking;
  const nights = Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24));
  const isUpdating = updateMutation.isPending;

  const handleAction = (newStatus: BookingStatus) => {
    updateMutation.mutate(
      { id: booking.id, status: newStatus },
      {
        onSuccess: () => {
          setToast({ message: `Booking updated to ${newStatus.replace("_", " ")}`, type: "success" });
        },
        onError: (err: any) => {
          setToast({ message: err?.response?.data?.message || "Update failed", type: "error" });
        },
      }
    );
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <html>
        <head>
          <title>Invoice - ${booking.bookingCode}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; }
            .header-left h1 { margin: 0; font-size: 28px; color: #ec4899; }
            .header-left p { margin: 5px 0 0; color: #6b7280; font-size: 14px; }
            .header-right { text-align: right; }
            .header-right h2 { margin: 0; font-size: 24px; color: #111827; font-weight: 500; text-transform: uppercase; letter-spacing: 2px; }
            .header-right p { margin: 5px 0 0; color: #6b7280; font-size: 14px; }
            
            .billing-info { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .billing-col h3 { font-size: 12px; text-transform: uppercase; color: #9ca3af; margin-bottom: 10px; letter-spacing: 1px; }
            .billing-col p { margin: 0 0 5px; font-size: 14px; font-weight: 500; }
            .billing-col p.light { color: #6b7280; font-weight: 400; }

            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; padding: 12px; background-color: #f9fafb; color: #4b5563; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; }
            td { padding: 16px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827; }
            .total-row { border-top: 2px solid #111827; font-weight: bold; }
            .total-row td { background-color: #f9fafb; font-size: 16px; }
            
            .footer { margin-top: 50px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              <h1>PinkLotus</h1>
              <p>Luxury Hotel & Apartments</p>
            </div>
            <div class="header-right">
              <h2>INVOICE</h2>
              <p>${booking.bookingCode}</p>
              <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <div class="billing-info">
            <div class="billing-col">
              <h3>Billed To</h3>
              <p>${booking.customer.fullname}</p>
              <p class="light">${booking.customer.email}</p>
              ${booking.customer.phone ? `<p class="light">${booking.customer.phone}</p>` : ''}
            </div>
            <div class="billing-col" style="text-align: right;">
              <h3>Booking Status</h3>
              <p>${booking.status.replace("_", " ")}</p>
              <p class="light">Check-in: ${new Date(booking.checkIn).toLocaleDateString()}</p>
              <p class="light">Check-out: ${new Date(booking.checkOut).toLocaleDateString()}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Guests</th>
                <th>Nights</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${booking.apartment ? booking.apartment.name : booking.room?.name}</strong>
                  <div style="color: #6b7280; font-size: 12px; margin-top: 4px;">
                    ${booking.apartment ? 'Entire Apartment' : 'Private Room'}
                  </div>
                </td>
                <td>${booking.guests}</td>
                <td>${nights}</td>
                <td style="text-align: right;">$${booking.totalAmount}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" style="text-align: right;">Total Amount</td>
                <td style="text-align: right;">$${booking.totalAmount}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>Thank you for choosing PinkLotus. We hope you enjoy your stay!</p>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              Booking {booking.bookingCode}
              <StatusBadge status={booking.status} />
              <SourceBadge source={booking.source} />
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Created on {new Date(booking.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Stay Info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Stay Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="col-span-2 md:col-span-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Accommodation</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {booking.apartment ? `${booking.apartment.name} (Entire Apartment)` : booking.room?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Guests</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{booking.guests} Guests</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Check-in</p>
                <p className="font-semibold text-gray-900 dark:text-white">{new Date(booking.checkIn).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500 mt-1">From 14:00</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Check-out</p>
                <p className="font-semibold text-gray-900 dark:text-white">{new Date(booking.checkOut).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500 mt-1">Until 12:00</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Duration</p>
                <p className="font-semibold text-gray-900 dark:text-white">{nights} Nights</p>
              </div>
              <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-xl border border-brand-100">
                <p className="text-xs text-brand-600 uppercase tracking-wider mb-1">Total Amount</p>
                <p className="font-bold text-brand-700 text-lg">${booking.totalAmount}</p>
              </div>
            </div>

            {booking.apartment && booking.apartment.rooms && booking.apartment.rooms.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Included Rooms in Apartment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {booking.apartment.rooms.map(r => (
                    <div key={r.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center text-lg">🛏️</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                        <p className="text-xs text-gray-500">Max {r.maxGuests || 2} Guests</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Guest Information</h3>
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="w-14 h-14 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                {booking.customer.fullname.charAt(0)}
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{booking.customer.fullname}</p>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <span>✉️ {booking.customer.email}</span>
                </p>
                {booking.customer.phone && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <span>📞 {booking.customer.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {booking.specialRequest && (
              <div className="mt-5 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                <h4 className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2">Special Request</h4>
                <p className="text-sm text-yellow-900 dark:text-yellow-100">{booking.specialRequest}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column: Actions & Payments */}
        <div className="space-y-6">
          
          {/* Actions */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Manage Booking</h3>
            <div className="space-y-3">
              {booking.status === "PENDING" && (
                <>
                  <button disabled={isUpdating} onClick={() => handleAction("CONFIRMED")} className="w-full py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl disabled:opacity-50 transition-colors shadow-sm">{isUpdating ? "Processing..." : "✓ Confirm Booking"}</button>
                  <button disabled={isUpdating} onClick={() => handleAction("CANCELLED")} className="w-full py-3 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl disabled:opacity-50 transition-colors">Cancel Booking</button>
                </>
              )}
              {booking.status === "CONFIRMED" && (
                <>
                  <button disabled={isUpdating} onClick={() => handleAction("CHECKED_IN")} className="w-full py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 transition-colors shadow-sm">{isUpdating ? "Processing..." : "Check In Guest"}</button>
                  <button disabled={isUpdating} onClick={() => handleAction("NO_SHOW")} className="w-full py-3 text-sm font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl disabled:opacity-50 transition-colors">Mark as No Show</button>
                </>
              )}
              {booking.status === "CHECKED_IN" && (
                <button disabled={isUpdating} onClick={() => handleAction("CHECKED_OUT")} className="w-full py-3 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl disabled:opacity-50 transition-colors shadow-sm">{isUpdating ? "Processing..." : "Check Out Guest"}</button>
              )}
              {["CHECKED_OUT", "CANCELLED", "NO_SHOW"].includes(booking.status) && (
                <div className="p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-500 font-medium border border-gray-100">
                  This booking is closed.
                </div>
              )}
            </div>
          </div>

          <BookingPaymentsSection booking={booking} />

        </div>
      </div>
    </div>
  );
}
