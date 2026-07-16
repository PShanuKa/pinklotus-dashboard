"use client";

import React from "react";
import { useDashboardStatsQuery } from "../../../services/dashboardApi";
import { HotelMetrics } from "@/components/dashboard/HotelMetrics";
import HotelRevenueChart from "@/components/dashboard/HotelRevenueChart";
import RecentBookingsTable from "@/components/dashboard/RecentBookingsTable";

export default function Ecommerce() {
  const { data: stats, isLoading, error } = useDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading Dashboard Analytics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500">
        <p>Failed to load dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Metrics Row */}
      <div className="col-span-12">
        <HotelMetrics stats={stats} />
      </div>

      {/* Main Content Area */}
      <div className="col-span-12 xl:col-span-8 space-y-6">
        <HotelRevenueChart chartData={stats.chartData} />
        <RecentBookingsTable bookings={stats.recentBookings} />
      </div>

      {/* Side Content Area (Today's Quick Summary) */}
      <div className="col-span-12 xl:col-span-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
            Today's Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-800 dark:text-white/90">Check-ins</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Arriving today</p>
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">{stats.todayActivity.checkIns}</h4>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-orange-50 p-4 dark:bg-orange-900/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/50">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-800 dark:text-white/90">Check-outs</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Departing today</p>
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">{stats.todayActivity.checkOuts}</h4>
            </div>
            
            <a href="/pos" className="mt-4 flex w-full justify-center rounded-lg border border-gray-200 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/5">
              Go to POS System
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
