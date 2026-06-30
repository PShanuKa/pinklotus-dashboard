'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createRoom } from "@/lib/api/rooms.api";
import { getHotels } from "@/lib/api/hotels.api";
import { FiLoader, FiArrowLeft } from "react-icons/fi";
import { toast } from "sonner";
import Link from "next/link";

export default function NewRoomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    hotelId: "",
    name: "",
    slug: "",
    type: "Single",
    price: 0,
    size: 0,
    maxGuests: 2,
    beds: "",
    description: "",
    amenities: "",
    images: "",
  });

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const data = await getHotels();
        setHotels(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, hotelId: data[0].id }));
        }
      } catch (err) {
        toast.error("Failed to fetch hotels for selection");
      }
    };
    fetchHotels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const imagesArray = formData.images.split(',').map(url => url.trim()).filter(url => url.length > 0);
    const amenitiesArray = formData.amenities.split(',').map(item => item.trim()).filter(item => item.length > 0);

    const payload = {
      ...formData,
      price: Number(formData.price),
      size: Number(formData.size),
      maxGuests: Number(formData.maxGuests),
      images: imagesArray,
      amenities: amenitiesArray
    };

    try {
      await createRoom(payload);
      toast.success("Room created successfully!");
      router.push("/rooms");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/rooms" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Room</h1>
          <p className="text-sm text-gray-500">Create a new room in a property.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Property *</label>
              <select
                required
                value={formData.hotelId}
                onChange={(e) => setFormData({...formData, hotelId: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {hotels.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Deluxe Ocean View"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. deluxe-ocean-view"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Suite">Suite</option>
                <option value="Apartment">Apartment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night ($) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size (sqm)</label>
              <input
                type="number"
                min="0"
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.maxGuests}
                onChange={(e) => setFormData({...formData, maxGuests: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beds (Description) *</label>
            <input
              type="text"
              required
              value={formData.beds}
              onChange={(e) => setFormData({...formData, beds: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 1 King Bed, 1 Sofa Bed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma separated)</label>
            <textarea
              rows={2}
              value={formData.amenities}
              onChange={(e) => setFormData({...formData, amenities: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Wifi, AC, TV"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs (comma separated)</label>
            <textarea
              rows={3}
              value={formData.images}
              onChange={(e) => setFormData({...formData, images: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://img1.jpg, https://img2.jpg"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? <FiLoader className="animate-spin" /> : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
