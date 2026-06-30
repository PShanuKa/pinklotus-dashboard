import { apiClient } from './client';

export const getHotels = async () => {
  const response = await apiClient.get('/hotels');
  return response.data;
};

export const getHotelById = async (id: string) => {
  const response = await apiClient.get(`/hotels/${id}`);
  return response.data;
};

export const createHotel = async (data: any) => {
  const response = await apiClient.post('/hotels', data);
  return response.data;
};

export const updateHotel = async (id: string, data: any) => {
  const response = await apiClient.put(`/hotels/${id}`, data);
  return response.data;
};

export const deleteHotel = async (id: string) => {
  const response = await apiClient.delete(`/hotels/${id}`);
  return response.data;
};
