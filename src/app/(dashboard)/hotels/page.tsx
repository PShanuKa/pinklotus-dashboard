'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHotels, deleteHotel } from "@/lib/api/hotels.api";
import { FiPlus, FiEdit2, FiTrash2, FiLoader } from "react-icons/fi";
import { toast } from "sonner";

export default function HotelsPage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHotels = async () => {
    try {
      const data = await getHotels();
      setHotels(data);
    } catch (err) {
      toast.error("Failed to fetch hotels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this hotel?")) return;
    const toastId = toast.loading("Deleting hotel...");
    try {
      await deleteHotel(id);
      toast.success("Hotel deleted successfully", { id: toastId });
      setHotels(hotels.filter(h => h.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete hotel", { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hotels</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all Pink Lotus property locations.</p>
        </div>
        <Link href="/hotels/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <FiPlus /> Add Hotel
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FiLoader className="animate-spin text-blue-600" size={30} />
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No hotels found. Click "Add Hotel" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone / Email</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hotels.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                      <div className="text-xs text-gray-500">{hotel.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {hotel.city}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{hotel.phone}</div>
                      <div className="text-sm text-gray-500">{hotel.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <Link href={`/hotels/${hotel.id}`} className="text-blue-600 hover:text-blue-900">
                          <FiEdit2 size={18} />
                        </Link>
                        <button onClick={() => handleDelete(hotel.id)} className="text-red-600 hover:text-red-900">
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
