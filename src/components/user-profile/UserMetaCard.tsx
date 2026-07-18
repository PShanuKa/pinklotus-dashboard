"use client";
import React from "react";
import { useGetMyProfile } from "../../../services/userApi";

export default function UserMetaCard() {
  const { data: user, isLoading } = useGetMyProfile();
  
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="w-20 h-20 overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center rounded-full dark:bg-gray-800 dark:border-gray-700">
            <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="order-3 xl:order-2">
            {isLoading ? (
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-2"></div>
            ) : (
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user?.fullname || "Unknown User"}
              </h4>
            )}
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              {isLoading ? (
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.role === "ADMIN" ? "Administrator" : "Manager"}
                </p>
              )}
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                PinkLotus Team
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
