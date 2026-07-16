import React from "react";
import Badge from "../ui/badge/Badge";

export default function RecentBookingsTable({ bookings }: { bookings: any[] }) {
  if (!bookings || bookings.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 py-4 sm:px-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Recent Bookings
        </h3>
        <a href="/online-bookings" className="text-sm text-brand-500 hover:underline">
          View All
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-5 py-3 font-medium">Booking ID</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Room</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {bookings.map((booking: any) => (
              <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                <td className="px-5 py-4 text-brand-500 font-medium">{booking.bookingCode}</td>
                <td className="px-5 py-4">
                  <div className="text-gray-900 dark:text-white font-medium">{booking.customerName}</div>
                  <div className="text-xs text-gray-500">{booking.customerEmail}</div>
                </td>
                <td className="px-5 py-4 text-gray-900 dark:text-white">{booking.roomName}</td>
                <td className="px-5 py-4">
                  <Badge
                    color={
                      booking.status === "CONFIRMED" ? "success" :
                      booking.status === "PENDING" ? "warning" :
                      booking.status === "CHECKED_IN" ? "success" :
                      "light"
                    }
                  >
                    {booking.status.replace("_", " ")}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-gray-900 dark:text-white font-medium">
                  ${booking.totalAmount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
