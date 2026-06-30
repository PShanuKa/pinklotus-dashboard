'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getBookingById, updateBookingStatus, deleteBooking } from "@/lib/api/bookings.api";
import { FiLoader, FiArrowLeft, FiPrinter, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

export default function BookingDetailsPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await getBookingById(id);
        setBooking(data);
      } catch (err) {
        toast.error("Failed to fetch booking details");
        router.push("/bookings");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBooking();
  }, [id, router]);

  const handleStatusChange = async (newStatus: string) => {
    const toastId = toast.loading("Updating status...");
    try {
      await updateBookingStatus(id, newStatus);
      toast.success("Status updated successfully", { id: toastId });
      setBooking({ ...booking, status: newStatus });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update status", { id: toastId });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to completely delete this booking?")) return;
    const toastId = toast.loading("Deleting booking...");
    try {
      await deleteBooking(id);
      toast.success("Booking deleted successfully", { id: toastId });
      router.push("/bookings");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete booking", { id: toastId });
    }
  };

  if (loading || !booking) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/bookings" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking #{booking.id.substring(0, 8).toUpperCase()}</h1>
            <p className="text-sm text-gray-500">Created on {format(new Date(booking.createdAt), "MMM dd, yyyy h:mm a")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <FiPrinter /> Print
          </button>
          <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100">
            <FiTrash2 /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Room & Stay Details</h2>
            
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Hotel</p>
                <p className="font-medium">{booking.room?.hotel?.name || "Unknown Hotel"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Room</p>
                <p className="font-medium text-blue-600">{booking.room?.name || "Unknown Room"}</p>
              </div>
              
              <div className="col-span-2 mt-2">
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Check In</p>
                    <p className="font-bold text-lg">{format(new Date(booking.checkIn), "MMM dd, yyyy")}</p>
                    <p className="text-sm text-gray-500">From 2:00 PM</p>
                  </div>
                  <div className="h-10 border-r border-gray-300"></div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Check Out</p>
                    <p className="font-bold text-lg">{format(new Date(booking.checkOut), "MMM dd, yyyy")}</p>
                    <p className="text-sm text-gray-500">Until 12:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Guests</p>
                <p className="font-medium">{booking.guests} Guests</p>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Nights</p>
                <p className="font-medium">
                  {Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))} Nights
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Customer Details</h2>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Full Name</p>
                <p className="font-medium">{booking.user?.name || booking.guestName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                <p className="font-medium">{booking.user?.email || booking.guestEmail}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone Number</p>
                <p className="font-medium">{booking.guestPhone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Account Status</p>
                {booking.user ? (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold">Registered User</span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-semibold">Guest Checkout</span>
                )}
              </div>
            </div>
            {booking.specialRequests && (
              <div className="mt-4 pt-4 border-t border-dashed">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Special Requests</p>
                <p className="text-sm bg-yellow-50 p-3 rounded text-yellow-800 border border-yellow-100">{booking.specialRequests}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Status & Pricing */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Booking Status</h2>
            <div className={`p-4 rounded-lg border ${getStatusColor(booking.status)} mb-4`}>
              <p className="text-xs uppercase tracking-wider mb-1 opacity-80">Current Status</p>
              <p className="text-xl font-bold">{booking.status}</p>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Update Status:</p>
              <select
                value={booking.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PENDING">Mark as Pending</option>
                <option value="CONFIRMED">Mark as Confirmed</option>
                <option value="CANCELLED">Mark as Cancelled</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Payment Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Room Rate / Night</span>
                <span className="font-medium">${booking.room?.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Number of Nights</span>
                <span className="font-medium">x {Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))}</span>
              </div>
              <div className="pt-3 border-t flex justify-between items-center">
                <span className="font-bold text-gray-900">Total Price</span>
                <span className="text-xl font-bold text-green-600">${booking.totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
