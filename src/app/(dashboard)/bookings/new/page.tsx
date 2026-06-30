'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/lib/api/bookings.api";
import { getRooms } from "@/lib/api/rooms.api";
import { FiLoader, FiArrowLeft, FiUser, FiCalendar, FiCreditCard } from "react-icons/fi";
import { toast } from "sonner";
import Link from "next/link";
import { differenceInDays } from "date-fns";

export default function POSBookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    specialRequests: "",
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getRooms();
        setRooms(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, roomId: data[0].id }));
        }
      } catch (err) {
        toast.error("Failed to fetch rooms");
      }
    };
    fetchRooms();
  }, []);

  const selectedRoom = useMemo(() => {
    return rooms.find(r => r.id === formData.roomId);
  }, [rooms, formData.roomId]);

  const totalNights = useMemo(() => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const days = differenceInDays(new Date(formData.checkOut), new Date(formData.checkIn));
    return days > 0 ? days : 0;
  }, [formData.checkIn, formData.checkOut]);

  const totalPrice = useMemo(() => {
    if (!selectedRoom || totalNights <= 0) return 0;
    return selectedRoom.price * totalNights;
  }, [selectedRoom, totalNights]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalNights <= 0) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        guests: Number(formData.guests),
        checkIn: new Date(formData.checkIn).toISOString(),
        checkOut: new Date(formData.checkOut).toISOString(),
      };
      
      await createBooking(payload);
      toast.success("Walk-in booking created successfully!");
      router.push("/bookings");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/bookings" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Walk-in Booking (POS)</h1>
          <p className="text-sm text-gray-500">Create a new booking manually for walk-in or phone reservations.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Guest Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-3">
              <FiUser className="text-blue-500" /> Guest Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.guestName}
                  onChange={(e) => setFormData({...formData, guestName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.guestEmail}
                  onChange={(e) => setFormData({...formData, guestEmail: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.guestPhone}
                  onChange={(e) => setFormData({...formData, guestPhone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+94 77..."
                />
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-3">
              <FiCalendar className="text-blue-500" /> Reservation Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Room *</label>
                <select
                  required
                  value={formData.roomId}
                  onChange={(e) => setFormData({...formData, roomId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.hotel?.name} - {r.name} (${r.price}/night)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.checkIn}
                  onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date *</label>
                <input
                  type="date"
                  required
                  min={formData.checkIn || new Date().toISOString().split('T')[0]}
                  value={formData.checkOut}
                  onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedRoom?.maxGuests || 10}
                  value={formData.guests}
                  onChange={(e) => setFormData({...formData, guests: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests (Optional)</label>
                <textarea
                  rows={2}
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Late check-in, extra pillows, etc."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <div className="bg-gray-800 text-white rounded-xl shadow-lg border border-gray-700 p-6 sticky top-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-gray-700 pb-3">
              <FiCreditCard className="text-blue-400" /> Booking Summary
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Selected Room</p>
                <p className="font-semibold text-lg">{selectedRoom ? selectedRoom.name : "None selected"}</p>
              </div>
              
              <div className="flex justify-between items-center py-2 border-y border-gray-700">
                <div className="text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Check In</p>
                  <p className="font-bold">{formData.checkIn || "--/--/----"}</p>
                </div>
                <div className="text-gray-500 text-xl">→</div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Check Out</p>
                  <p className="font-bold">{formData.checkOut || "--/--/----"}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <p className="text-gray-400">Length of stay</p>
                <p className="font-medium">{totalNights} Night(s)</p>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-gray-400">Rate per night</p>
                <p className="font-medium">${selectedRoom?.price || 0}</p>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-gray-400">Guests</p>
                <p className="font-medium">{formData.guests} Guest(s)</p>
              </div>
              
              <div className="pt-4 border-t border-gray-700 mt-2">
                <div className="flex justify-between items-end">
                  <p className="text-gray-300">Total Amount</p>
                  <p className="text-3xl font-bold text-green-400">${totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || totalNights <= 0}
              className="w-full flex justify-center items-center gap-2 px-6 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-900/20"
            >
              {loading ? <FiLoader className="animate-spin" /> : "Confirm & Create Booking"}
            </button>
            <p className="text-xs text-center text-gray-500 mt-4">
              Booking will be created with "PENDING" status by default.
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}
