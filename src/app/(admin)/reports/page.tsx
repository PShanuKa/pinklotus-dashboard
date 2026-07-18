"use client";

import React, { useState } from "react";
import { useReportsSummaryQuery } from "../../../../services/reportsApi";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import DatePicker from "@/components/form/date-picker";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data, isLoading } = useReportsSummaryQuery({ from: dateFrom, to: dateTo });

  if (isLoading) {
    return <div className="p-6 text-gray-500">Loading reports data...</div>;
  }

  const summary = data?.summary || { totalBookings: 0, totalRevenue: 0, totalCollected: 0, totalOutstanding: 0 };
  const sourceBreakdown = data?.sourceBreakdown || { online: 0, walkin: 0 };
  const topRooms = data?.topRooms || [];
  const chartData = data?.chartData || [];

  // ── Line Chart for Revenue ───────────────────────────────────────────────────
  const revenueChartOptions: ApexOptions = {
    chart: { type: "area", height: 300, toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    colors: ["#3b82f6"], // Blue
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories: chartData.map((d: any) => d.date),
      labels: { style: { colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { formatter: (val) => `$${val}`, style: { colors: "#9ca3af" } },
    },
    grid: { borderColor: "#f3f4f6", strokeDashArray: 4, yaxis: { lines: { show: true } } },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 100] },
    },
    tooltip: { y: { formatter: (val) => `$${val}` } },
  };

  const revenueChartSeries = [{ name: "Revenue", data: chartData.map((d: any) => d.revenue) }];

  // ── Donut Chart for Source ───────────────────────────────────────────────────
  const sourceChartOptions: ApexOptions = {
    chart: { type: "donut", fontFamily: "Outfit, sans-serif" },
    labels: ["Online Website", "Dashboard Walk-in"],
    colors: ["#3b82f6", "#a855f7"],
    legend: { position: "bottom", labels: { colors: "#9ca3af" } },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: "70%" } } },
    stroke: { show: false },
  };

  const sourceChartSeries = [sourceBreakdown.online, sourceBreakdown.walkin];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Comprehensive overview of hotel performance</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="w-48">
          <DatePicker
            id="from-date"
            label="From Date"
            placeholder="Select Start Date"
            defaultDate={dateFrom}
            onChange={(_, dateStr) => setDateFrom(dateStr)}
          />
        </div>
        <div className="w-48">
          <DatePicker
            id="to-date"
            label="To Date"
            placeholder="Select End Date"
            defaultDate={dateTo}
            onChange={(_, dateStr) => setDateTo(dateStr)}
          />
        </div>
        <div className="pt-7">
          <button
            onClick={() => { setDateFrom(""); setDateTo(""); }}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-300"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bookings</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{summary.totalBookings}</h3>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
          <h3 className="text-2xl font-bold text-brand-600 mt-2">${summary.totalRevenue}</h3>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Collected</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">${summary.totalCollected}</h3>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Outstanding Balance</p>
          <h3 className="text-2xl font-bold text-red-500 mt-2">${summary.totalOutstanding}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Over Time</h3>
          {chartData.length > 0 ? (
            <ReactApexChart options={revenueChartOptions} series={revenueChartSeries} type="area" height={300} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">No data available</div>
          )}
        </div>

        {/* Source Breakdown */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Source</h3>
          <div className="flex justify-center mt-4">
            <ReactApexChart options={sourceChartOptions} series={sourceChartSeries} type="donut" height={250} />
          </div>
        </div>
      </div>

      {/* Top Rooms */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performing Rooms</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Room Name</th>
                <th className="px-4 py-3">Bookings</th>
                <th className="px-4 py-3 text-right rounded-r-lg">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topRooms.length > 0 ? topRooms.map((room: any) => (
                <tr key={room.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{room.name}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{room.bookingsCount}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">${room.revenue}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">No bookings data found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
