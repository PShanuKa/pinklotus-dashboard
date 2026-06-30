import { apiClient } from './client';

export const getRooms = async () => {
  const response = await apiClient.get('/rooms');
  return response.data.data || response.data;
};

export const getRoomById = async (id: string) => {
  const response = await apiClient.get(`/rooms/${id}`);
  return response.data;
};

export const createRoom = async (data: any) => {
  const response = await apiClient.post('/rooms', data);
  return response.data;
};

export const updateRoom = async (id: string, data: any) => {
  const response = await apiClient.put(`/rooms/${id}`, data);
  return response.data;
};

export const deleteRoom = async (id: string) => {
  const response = await apiClient.delete(`/rooms/${id}`);
  return response.data;
};
