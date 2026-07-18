"use client";

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useCalendarBookingsQuery } from "../../../../services/bookingsApi";
import { useRouter } from "next/navigation";

export default function CalendarPage() {
  const router = useRouter();
  
  // By default, fetch a wide range (e.g. current month +/- 1)
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString();
  const end = new Date(today.getFullYear(), today.getMonth() + 2, 0).toISOString();

  const { data, isLoading } = useCalendarBookingsQuery({ start, end });

  const getEventColor = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "#3b82f6"; // blue
      case "CHECKED_IN": return "#22c55e"; // green
      case "PENDING": return "#eab308"; // yellow
      case "CHECKED_OUT": return "#6b7280"; // gray
      case "CANCELLED":
      case "NO_SHOW": return "#ef4444"; // red
      default: return "#3b82f6";
    }
  };

  const events = data?.bookings?.map((b: any) => ({
    id: b.id,
    title: `${b.room?.name || "Room"} - ${b.customer?.fullname}`,
    start: b.checkIn,
    end: b.checkOut,
    backgroundColor: getEventColor(b.status),
    borderColor: getEventColor(b.status),
    extendedProps: {
      status: b.status,
      room: b.room?.name,
      customer: b.customer?.fullname,
    }
  })) || [];

  const handleEventClick = (info: any) => {
    // Navigate to the bookings page and maybe pre-filter or highlight this booking
    // For now, redirecting to online-bookings where they can search for it
    router.push(`/online-bookings?search=${info.event.extendedProps.customer}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Calendar</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View and manage room availability</p>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
        {isLoading ? (
          <div className="flex items-center justify-center h-[500px] text-gray-500">Loading calendar...</div>
        ) : (
          <div className="calendar-container">
            <style jsx global>{`
              .fc-theme-standard .fc-scrollgrid { border-color: var(--color-gray-200); }
              .dark .fc-theme-standard .fc-scrollgrid { border-color: var(--color-gray-800); }
              .fc-theme-standard th, .fc-theme-standard td { border-color: var(--color-gray-200); }
              .dark .fc-theme-standard th, .dark .fc-theme-standard td { border-color: var(--color-gray-800); }
              .fc-day-today { background-color: rgba(59, 130, 246, 0.05) !important; }
              .fc-col-header-cell-cushion, .fc-daygrid-day-number { color: var(--color-gray-700); }
              .dark .fc-col-header-cell-cushion, .dark .fc-daygrid-day-number { color: var(--color-gray-300); }
              .fc-event { cursor: pointer; transition: opacity 0.2s; }
              .fc-event:hover { opacity: 0.9; }
              .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 600; color: var(--color-gray-900); }
              .dark .fc-toolbar-title { color: var(--color-white); }
              .fc-button-primary { background-color: var(--color-brand-600) !important; border-color: var(--color-brand-600) !important; }
              .fc-button-primary:hover { background-color: var(--color-brand-700) !important; border-color: var(--color-brand-700) !important; }
              .fc-button-active { background-color: var(--color-brand-800) !important; border-color: var(--color-brand-800) !important; }
            `}</style>
            
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay"
              }}
              events={events}
              eventClick={handleEventClick}
              height="700px"
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
              }}
              displayEventEnd={true}
            />
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Pending</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Confirmed</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Checked In</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-500"></span> Checked Out</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Cancelled / No Show</div>
      </div>
    </div>
  );
}
