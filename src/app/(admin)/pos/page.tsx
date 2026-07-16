"use client";

import React, { useState, useMemo } from "react";
import { useRoomsQuery } from "../../../../services/roomsApi";
import {
  useActiveTodayQuery,
  useCreateDashboardBookingMutation,
  useUpdateBookingMutation,
  useQuickCreateCustomerMutation,
} from "../../../../services/bookingsApi";
import { useCustomersQuery } from "../../../../services/userApi";

// ── Types ──────────────────────────────────────────────────────
type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

// ── Toast ──────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-top-4 fade-in duration-300 ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
      <span>{type === "success" ? "✓" : "✕"}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}

// ── Main POS Page ──────────────────────────────────────────────
export default function POSPage() {
  const { data: roomsData, isLoading: roomsLoading } = useRoomsQuery({}, { refetchInterval: 30000 });
  const { data: todayData, isLoading: todayLoading } = useActiveTodayQuery();
  const { data: customersData } = useCustomersQuery();

  const createBookingMutation = useCreateDashboardBookingMutation();
  const updateBookingMutation = useUpdateBookingMutation();
  const quickCreateCustomer = useQuickCreateCustomerMutation();

  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSlideOver, setShowSlideOver] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [statusFilter, setStatusFilter] = useState<RoomStatus | "ALL">("ALL");

  const rooms = roomsData?.rooms || [];
  const todayBookings = todayData?.bookings || [];
  const customers = customersData?.customers || [];

  const todayStr = new Date().toISOString().split("T")[0];
  const todayCheckIns = todayBookings.filter((b: any) => b.checkIn.startsWith(todayStr) && ["CONFIRMED", "CHECKED_IN"].includes(b.status));
  const todayCheckOuts = todayBookings.filter((b: any) => b.checkOut.startsWith(todayStr) && ["CHECKED_IN", "CHECKED_OUT"].includes(b.status));

  // Build room→booking map for occupied rooms
  const roomBookingMap = useMemo(() => {
    const map: Record<string, any> = {};
    todayBookings.forEach((b: any) => {
      if (["CONFIRMED", "CHECKED_IN"].includes(b.status)) {
        map[b.room.id] = b;
      }
    });
    return map;
  }, [todayBookings]);

  const filteredRooms = statusFilter === "ALL" ? rooms : rooms.filter((r: any) => r.status === statusFilter);
  const availableCount = rooms.filter((r: any) => r.status === "AVAILABLE").length;
  const occupiedCount = rooms.filter((r: any) => r.status === "OCCUPIED").length;
  const maintenanceCount = rooms.filter((r: any) => r.status === "MAINTENANCE").length;
  const occupancyPct = rooms.length > 0 ? Math.round((occupiedCount / rooms.length) * 100) : 0;

  const handleRoomClick = (room: any) => {
    setSelectedRoom(room);
    if (room.status === "AVAILABLE") {
      setShowBookingModal(true);
    } else {
      setShowSlideOver(true);
    }
  };

  const handleCheckIn = (bookingId: string) => {
    updateBookingMutation.mutate({ id: bookingId, status: "CHECKED_IN" }, {
      onSuccess: () => {
        setToast({ message: "Guest checked in successfully!", type: "success" });
        setShowSlideOver(false);
      },
      onError: (err: any) => setToast({ message: err?.response?.data?.message || "Check-in failed", type: "error" }),
    });
  };

  const handleCheckOut = (bookingId: string) => {
    updateBookingMutation.mutate({ id: bookingId, status: "CHECKED_OUT" }, {
      onSuccess: () => {
        setToast({ message: "Guest checked out successfully!", type: "success" });
        setShowSlideOver(false);
      },
      onError: (err: any) => setToast({ message: err?.response?.data?.message || "Check-out failed", type: "error" }),
    });
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{rooms.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Rooms</p>
        </div>
        <button onClick={() => setStatusFilter(statusFilter === "AVAILABLE" ? "ALL" : "AVAILABLE")} className={`rounded-xl border p-4 text-left transition-all ${statusFilter === "AVAILABLE" ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"}`}>
          <p className="text-3xl font-bold text-green-600">{availableCount}</p>
          <p className="text-xs text-gray-500 mt-1">Available</p>
        </button>
        <button onClick={() => setStatusFilter(statusFilter === "OCCUPIED" ? "ALL" : "OCCUPIED")} className={`rounded-xl border p-4 text-left transition-all ${statusFilter === "OCCUPIED" ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"}`}>
          <p className="text-3xl font-bold text-red-600">{occupiedCount}</p>
          <p className="text-xs text-gray-500 mt-1">Occupied</p>
        </button>
        <button onClick={() => setStatusFilter(statusFilter === "MAINTENANCE" ? "ALL" : "MAINTENANCE")} className={`rounded-xl border p-4 text-left transition-all ${statusFilter === "MAINTENANCE" ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"}`}>
          <p className="text-3xl font-bold text-yellow-600">{maintenanceCount}</p>
          <p className="text-xs text-gray-500 mt-1">Maintenance</p>
        </button>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4">
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.91549430918954" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.91549430918954" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray={`${occupancyPct} ${100 - occupancyPct}`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">{occupancyPct}%</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Occupancy</p>
            <p className="text-xs text-gray-500">Rate</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        {/* LEFT: Room Grid */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Room Grid
              {statusFilter !== "ALL" && <span className="text-sm font-normal text-gray-400 ml-2">— {statusFilter} only</span>}
            </h2>
            {statusFilter !== "ALL" && (
              <button onClick={() => setStatusFilter("ALL")} className="text-xs text-brand-500 hover:underline">Show All</button>
            )}
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            {roomsLoading ? (
              <div className="flex items-center justify-center h-full text-gray-400">Loading rooms...</div>
            ) : filteredRooms.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">No rooms match this filter</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredRooms.map((room: any) => {
                  const activeBooking = roomBookingMap[room.id];
                  return (
                    <button
                      key={room.id}
                      onClick={() => handleRoomClick(room)}
                      className={`relative p-4 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-95 min-h-[130px] ${
                        room.status === "AVAILABLE"
                          ? "bg-green-50/60 border-green-200 hover:border-green-400 hover:shadow-green-100 dark:bg-green-900/10 dark:border-green-800"
                          : room.status === "OCCUPIED"
                          ? "bg-red-50/60 border-red-200 hover:border-red-400 hover:shadow-red-100 dark:bg-red-900/10 dark:border-red-800"
                          : "bg-yellow-50/60 border-yellow-200 hover:border-yellow-400 dark:bg-yellow-900/10 dark:border-yellow-800"
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="font-bold text-lg text-gray-900 dark:text-white">{room.roomNumber || room.name.substring(0, 8)}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          room.status === "AVAILABLE" ? "bg-green-200 text-green-800" :
                          room.status === "OCCUPIED" ? "bg-red-200 text-red-800" : "bg-yellow-200 text-yellow-800"
                        }`}>{room.status}</span>
                      </div>
                      <div className="text-left mt-2">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 line-clamp-1">{room.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">${room.pricePerNight}/night</p>
                        {activeBooking && room.status === "OCCUPIED" && (
                          <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                            <p className="text-[11px] font-semibold text-red-700 dark:text-red-400 truncate">👤 {activeBooking.customer.fullname}</p>
                            <p className="text-[10px] text-red-500 dark:text-red-500">Out: {new Date(activeBooking.checkOut).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Today's Activity */}
        <div className="w-full md:w-80 flex flex-col gap-4 min-h-0">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">📥 Today's Check-ins</h2>
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{todayCheckIns.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {todayLoading ? (
                <div className="text-center py-4 text-xs text-gray-400">Loading...</div>
              ) : todayCheckIns.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400">No check-ins today</div>
              ) : (
                <ul className="space-y-1">
                  {todayCheckIns.map((b: any) => (
                    <li key={b.id} className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{b.customer.fullname}</p>
                        <p className="text-[11px] text-gray-500">{b.room.name} • {b.guests} guests</p>
                      </div>
                      {b.status === "CONFIRMED" && (
                        <button onClick={() => handleCheckIn(b.id)} className="text-[10px] font-bold px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors whitespace-nowrap">
                          Check In
                        </button>
                      )}
                      {b.status === "CHECKED_IN" && (
                        <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 rounded-md">IN</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">📤 Today's Check-outs</h2>
              <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{todayCheckOuts.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {todayLoading ? (
                <div className="text-center py-4 text-xs text-gray-400">Loading...</div>
              ) : todayCheckOuts.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400">No check-outs today</div>
              ) : (
                <ul className="space-y-1">
                  {todayCheckOuts.map((b: any) => (
                    <li key={b.id} className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{b.customer.fullname}</p>
                        <p className="text-[11px] text-gray-500">{b.room.name}</p>
                      </div>
                      {b.status === "CHECKED_IN" && (
                        <button onClick={() => handleCheckOut(b.id)} className="text-[10px] font-bold px-2 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors whitespace-nowrap">
                          Check Out
                        </button>
                      )}
                      {b.status === "CHECKED_OUT" && (
                        <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded-md">DONE</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Walk-in Booking Modal (Available rooms) */}
      {showBookingModal && selectedRoom && (
        <WalkInBookingModal
          room={selectedRoom}
          customers={customers}
          onClose={() => setShowBookingModal(false)}
          onSubmit={(data: any) => {
            createBookingMutation.mutate(data, {
              onSuccess: (res: any) => {
                setShowBookingModal(false);
                setToast({ message: `Booking ${res.booking.bookingCode} created!`, type: "success" });
              },
              onError: (err: any) => setToast({ message: err?.response?.data?.message || "Booking failed", type: "error" }),
            });
          }}
          onQuickCreateCustomer={(data: any) => quickCreateCustomer.mutateAsync(data)}
          isLoading={createBookingMutation.isPending}
        />
      )}

      {/* Room Detail Slide-over (Occupied/Maintenance rooms) */}
      {showSlideOver && selectedRoom && (
        <RoomSlideOver
          room={selectedRoom}
          booking={roomBookingMap[selectedRoom.id]}
          onClose={() => setShowSlideOver(false)}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          isUpdating={updateBookingMutation.isPending}
        />
      )}
    </div>
  );
}

// ── Walk-in Booking Modal ──────────────────────────────────────
function WalkInBookingModal({ room, customers, onClose, onSubmit, onQuickCreateCustomer, isLoading }: any) {
  const [formData, setFormData] = useState({
    customerId: "",
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: "",
    guests: 1,
    discount: 0,
    specialRequest: "",
  });
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ fullname: "", email: "", phone: "" });
  const [customerSearch, setCustomerSearch] = useState("");
  const [error, setError] = useState("");
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  const filteredCustomers = customers.filter((c: any) =>
    c.fullname.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  ).slice(0, 10);

  const calculateTotal = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const cin = new Date(formData.checkIn);
    const cout = new Date(formData.checkOut);
    const nights = Math.ceil((cout.getTime() - cin.getTime()) / (1000 * 60 * 60 * 24));
    const subtotal = nights > 0 ? nights * room.pricePerNight : 0;
    return Math.max(0, subtotal - formData.discount);
  };

  const getNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    return Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleQuickCreate = async () => {
    if (!newCustomer.fullname) { setError("Customer name is required"); return; }
    setCreatingCustomer(true);
    setError("");
    try {
      const res = await onQuickCreateCustomer(newCustomer);
      setFormData({ ...formData, customerId: res.customer.id });
      setShowNewCustomer(false);
      setCustomerSearch(res.customer.fullname);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create customer");
    } finally {
      setCreatingCustomer(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.customerId) { setError("Please select or create a customer"); return; }
    if (!formData.checkOut) { setError("Please select check-out date"); return; }
    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) { setError("Check-out must be after check-in"); return; }
    onSubmit({
      roomId: room.id,
      ...formData,
      totalAmount: calculateTotal(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Walk-in Booking</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-xl">✕</button>
        </div>
        <div className="p-6">
          <div className="mb-5 p-4 bg-gradient-to-r from-brand-50 to-blue-50 dark:from-brand-900/20 dark:to-blue-900/20 rounded-xl border border-brand-200 dark:border-brand-800">
            <h3 className="font-bold text-gray-900 dark:text-white">{room.name}</h3>
            <p className="text-sm text-gray-500">${room.pricePerNight}/night • Max {room.maxGuests} guests</p>
          </div>

          {error && <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer</label>
                <button type="button" onClick={() => setShowNewCustomer(!showNewCustomer)} className="text-xs text-brand-500 hover:underline">
                  {showNewCustomer ? "Select Existing" : "+ New Customer"}
                </button>
              </div>
              {showNewCustomer ? (
                <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <input type="text" placeholder="Full Name *" value={newCustomer.fullname} onChange={(e) => setNewCustomer({ ...newCustomer, fullname: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="email" placeholder="Email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800" />
                    <input type="text" placeholder="Phone" value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800" />
                  </div>
                  <button type="button" onClick={handleQuickCreate} disabled={creatingCustomer} className="w-full py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50">
                    {creatingCustomer ? "Creating..." : "Create & Select"}
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={customerSearch}
                    onChange={(e) => { setCustomerSearch(e.target.value); setFormData({ ...formData, customerId: "" }); }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800"
                  />
                  {customerSearch && !formData.customerId && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {filteredCustomers.length === 0 ? (
                        <div className="p-3 text-xs text-gray-400 text-center">No customers found</div>
                      ) : (
                        filteredCustomers.map((c: any) => (
                          <button key={c.id} type="button" onClick={() => { setFormData({ ...formData, customerId: c.id }); setCustomerSearch(c.fullname); }} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <span className="font-medium text-gray-900 dark:text-white">{c.fullname}</span>
                            <span className="text-xs text-gray-500 ml-2">{c.email}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                  {formData.customerId && <p className="mt-1 text-xs text-green-600">✓ Customer selected</p>}
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Check-in</label>
                <input type="date" required value={formData.checkIn} min={new Date().toISOString().split("T")[0]} onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Check-out</label>
                <input type="date" required value={formData.checkOut} min={formData.checkIn || new Date().toISOString().split("T")[0]} onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800" />
              </div>
            </div>

            {/* Guests + Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guests</label>
                <input type="number" min="1" max={room.maxGuests || 10} value={formData.guests} onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount ($)</label>
                <input type="number" min="0" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800" />
              </div>
            </div>

            {/* Special Request */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Special Requests</label>
              <textarea value={formData.specialRequest} onChange={(e) => setFormData({ ...formData, specialRequest: e.target.value })} rows={2} placeholder="Extra bed, late check-out..." className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 resize-none" />
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>${room.pricePerNight} × {getNights()} night{getNights() !== 1 ? "s" : ""}</span>
                <span>${room.pricePerNight * getNights()}</span>
              </div>
              {formData.discount > 0 && (
                <div className="flex justify-between text-sm text-red-500 mb-1">
                  <span>Discount</span>
                  <span>-${formData.discount}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-2xl font-bold text-brand-600">${calculateTotal()}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 transition-colors">Cancel</button>
              <button type="submit" disabled={isLoading} className="flex-1 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl disabled:opacity-50 transition-colors">
                {isLoading ? "Creating..." : "Confirm Booking"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Room Detail Slide-over ─────────────────────────────────────
function RoomSlideOver({ room, booking, onClose, onCheckIn, onCheckOut, isUpdating }: any) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Room Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl transition-colors">✕</button>
        </div>

        <div className="p-5 space-y-6">
          {/* Room Info */}
          <div className={`p-4 rounded-xl border ${
            room.status === "OCCUPIED" ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800" :
            room.status === "MAINTENANCE" ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800" :
            "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{room.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Room #{room.roomNumber || "N/A"} • ${room.pricePerNight}/night</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                room.status === "OCCUPIED" ? "bg-red-200 text-red-800" :
                room.status === "MAINTENANCE" ? "bg-yellow-200 text-yellow-800" :
                "bg-green-200 text-green-800"
              }`}>{room.status}</span>
            </div>
          </div>

          {/* Current Booking */}
          {booking ? (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Current Booking</h4>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
                    {booking.customer.fullname.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{booking.customer.fullname}</p>
                    <p className="text-xs text-gray-500">{booking.customer.email}</p>
                    {booking.customer.phone && <p className="text-xs text-gray-500">📞 {booking.customer.phone}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase">Check-in</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(booking.checkIn).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase">Check-out</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(booking.checkOut).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase">Guests</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{booking.guests}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase">Total</p>
                    <p className="text-sm font-bold text-brand-600">${booking.totalAmount}</p>
                  </div>
                </div>
                {booking.specialRequest && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-[11px] text-gray-400 uppercase mb-1">Special Request</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{booking.specialRequest}</p>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-[11px] text-gray-400 uppercase mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    booking.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                    booking.status === "CHECKED_IN" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {booking.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {booking.status === "CONFIRMED" && (
                  <button onClick={() => onCheckIn(booking.id)} disabled={isUpdating} className="w-full py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                    {isUpdating ? "Processing..." : "✓ Check In Guest"}
                  </button>
                )}
                {booking.status === "CHECKED_IN" && (
                  <button onClick={() => onCheckOut(booking.id)} disabled={isUpdating} className="w-full py-3 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                    {isUpdating ? "Processing..." : "↗ Check Out Guest"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">
                {room.status === "MAINTENANCE" ? "🔧 This room is under maintenance" : "No active booking for this room"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
