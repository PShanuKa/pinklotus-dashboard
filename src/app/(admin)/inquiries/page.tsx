"use client";

import React, { useState } from "react";
import PageMeta from "@/components/common/PageMeta";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useInquiriesQuery, useMarkInquiryReadMutation, useDeleteInquiryMutation } from "../../../../services/inquiriesApi";
import { format } from "date-fns";
import { FiCheck, FiTrash2, FiMail } from "react-icons/fi";

export default function InquiriesPage() {
  const { data: response, isLoading } = useInquiriesQuery();
  const markReadMutation = useMarkInquiryReadMutation();
  const deleteMutation = useDeleteInquiryMutation();

  const inquiries = response?.data || [];

  if (isLoading) return <div className="p-6">Loading inquiries...</div>;

  return (
    <div className="p-6">
      <PageMeta
        title="Inquiries | Pink Lotus Residences"
        description="Manage contact form inquiries"
      />
      <PageBreadcrumb pageTitle="Contact Inquiries" />

      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            All Inquiries
          </h2>
          <span className="bg-brand-500/10 text-brand-500 px-3 py-1 rounded-full text-sm font-medium">
            {inquiries.filter((i: any) => !i.isRead).length} Unread
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm border-b border-gray-100 dark:border-gray-700">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Message</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No inquiries found.
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry: any) => (
                  <tr 
                    key={inquiry.id} 
                    className={`border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!inquiry.isRead ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''}`}
                  >
                    <td className="p-4">
                      <p className={`text-sm ${!inquiry.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {inquiry.name}
                      </p>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {inquiry.email}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={inquiry.message}>
                      {inquiry.message}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(inquiry.createdAt), "MMM d, yyyy h:mm a")}
                    </td>
                    <td className="p-4">
                      {inquiry.isRead ? (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          Read
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                          New
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!inquiry.isRead && (
                          <button
                            onClick={() => markReadMutation.mutate(inquiry.id)}
                            disabled={markReadMutation.isPending}
                            className="p-2 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <FiCheck className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if(window.confirm("Are you sure you want to delete this inquiry?")) {
                              deleteMutation.mutate(inquiry.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
