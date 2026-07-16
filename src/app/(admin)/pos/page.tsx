"use client";

import React, { useState } from "react";
import { useRoomsQuery } from "../../../../services/roomsApi";
import { useDashboardBookingsQuery, useCreateDashboardBookingMutation } from "../../../../services/bookingsApi";
import { useCustomersQuery } from "../../../../services/userApi";

export default function POSPage() {
  const { data: roomsData, isLoading: roomsLoading } = useRoomsQuery();
  const { data: bookingsData, isLoading: bookingsLoading } = useDashboardBookingsQuery();
  const { data: customersData } = useCustomersQuery();
  
  const createBookingMutation = useCreateDashboardBookingMutation();

  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const rooms = roomsData?.rooms || [];
  const bookings = bookingsData?.bookings || [];
  const customers = customersData?.customers || [];

  const todayStr = new Date().toISOString().split("T")[0];

  const todayCheckIns = bookings.filter((b: any) => b.checkIn.startsWith(todayStr));
  const todayCheckOuts = bookings.filter((b: any) => b.checkOut.startsWith(todayStr));

  const availableRooms = rooms.filter((r: any) => r.status === "AVAILABLE").length;
  const occupiedRooms = rooms.filter((r: any) => r.status === "OCCUPIED").length;
  const maintenanceRooms = rooms.filter((r: any) => r.status === "MAINTENANCE").length;

  const handleRoomClick = (room: any) => {
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
      
      {/* LEFT PANEL: Room Grid */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Room Grid</h2>
          <div className="flex gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500"></div> Available ({availableRooms})</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div> Occupied ({occupiedRooms})</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Maintenance ({maintenanceRooms})</span>
          </div>
        </div>
        <div className="p-5 flex-1 overflow-y-auto">
          {roomsLoading ? (
             <div className="flex items-center justify-center h-full text-gray-400">Loading rooms...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {rooms.map((room: any) => (
                <button
                  key={room.id}
                  onClick={() => handleRoomClick(room)}
                  className={`relative p-4 h-32 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-95 ${
                    room.status === "AVAILABLE"
                      ? "bg-green-50/50 border-green-200 hover:border-green-400 dark:bg-green-900/10 dark:border-green-800"
                      : room.status === "OCCUPIED"
                      ? "bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-800"
                      : "bg-yellow-50/50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800"
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="font-bold text-lg text-gray-900 dark:text-white">{room.roomNumber || room.name.substring(0,6)}</span>
                    <span className="text-xs font-medium text-gray-500">${room.pricePerNight}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-1">{room.name}</p>
                    <p className={`text-xs font-semibold mt-1 ${
                      room.status === "AVAILABLE" ? "text-green-600" :
                      room.status === "OCCUPIED" ? "text-red-600" : "text-yellow-600"
                    }`}>
                      {room.status}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Today's Activity */}
      <div className="w-full md:w-80 flex flex-col gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Today's Check-ins</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {bookingsLoading ? (
              <div className="text-center py-4 text-xs text-gray-400">Loading...</div>
            ) : todayCheckIns.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">No check-ins today</div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {todayCheckIns.map((b: any) => (
                  <li key={b.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{b.customer.fullname}</p>
                    <p className="text-xs text-gray-500">{b.room.name} • {b.guests} Guests</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Today's Check-outs</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {bookingsLoading ? (
              <div className="text-center py-4 text-xs text-gray-400">Loading...</div>
            ) : todayCheckOuts.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">No check-outs today</div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {todayCheckOuts.map((b: any) => (
                  <li key={b.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{b.customer.fullname}</p>
                    <p className="text-xs text-gray-500">{b.room.name}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal for POS Walk-ins */}
      {showBookingModal && selectedRoom && (
        <WalkInBookingModal
          room={selectedRoom}
          customers={customers}
          onClose={() => setShowBookingModal(false)}
          onSubmit={(data) => {
            createBookingMutation.mutate(data, {
              onSuccess: () => setShowBookingModal(false)
            });
          }}
          isLoading={createBookingMutation.isPending}
        />
      )}
    </div>
  );
}

function WalkInBookingModal({ room, customers, onClose, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    customerId: "",
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: "",
    guests: 1,
  });

  const calculateTotal = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const cin = new Date(formData.checkIn);
    const cout = new Date(formData.checkOut);
    const nights = Math.ceil((cout.getTime() - cin.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights * room.pricePerNight : 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      roomId: room.id,
      ...formData,
      totalAmount: calculateTotal(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Walk-in Booking</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
        </div>
        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{room.name}</h3>
            <p className="text-sm text-gray-500">${room.pricePerNight} / night</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800"
              >
                <option value="">Select a customer...</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.fullname} ({c.email})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Check-in</label>
                <input
                  type="date"
                  required
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Check-out</label>
                <input
                  type="date"
                  required
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guests</label>
              <input
                type="number"
                min="1"
                required
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800"
              />
            </div>
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <span className="text-gray-500 text-sm">Total Amount:</span>
              <span className="text-2xl font-bold text-brand-600">${calculateTotal()}</span>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700">Cancel</button>
              <button type="submit" disabled={isLoading || !formData.customerId} className="flex-1 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50">
                {isLoading ? "Saving..." : "Confirm Booking"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
