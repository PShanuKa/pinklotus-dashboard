'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBookings, deleteBooking, updateBookingStatus } from "@/lib/api/bookings.api";
import { FiEye, FiTrash2, FiLoader } from "react-icons/fi";
import { toast } from "sonner";
import { format } from "date-fns";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const data = await getBookings();
      setBookings(data);
    } catch (err) {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    const toastId = toast.loading("Deleting booking...");
    try {
      await deleteBooking(id);
      toast.success("Booking deleted successfully", { id: toastId });
      setBookings(bookings.filter(b => b.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete booking", { id: toastId });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const toastId = toast.loading("Updating status...");
    try {
      await updateBookingStatus(id, newStatus);
      toast.success("Status updated successfully", { id: toastId });
      setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update status", { id: toastId });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all customer reservations.</p>
        </div>
        <Link href="/bookings/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          New Booking (POS)
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FiLoader className="animate-spin text-blue-600" size={30} />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No bookings found in the system.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      #{booking.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.user?.name || booking.guestName}</div>
                      <div className="text-xs text-gray-500">{booking.user?.email || booking.guestEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.room?.name || 'Unknown Room'}</div>
                      <div className="text-xs text-gray-500 font-medium">${booking.totalPrice}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(booking.checkIn), 'MMM dd')} - {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-none focus:ring-0 ${getStatusColor(booking.status)}`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <Link href={`/bookings/${booking.id}`} className="text-blue-600 hover:text-blue-900">
                          <FiEye size={18} />
                        </Link>
                        <button onClick={() => handleDelete(booking.id)} className="text-red-600 hover:text-red-900">
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
