import { apiClient } from './client';

export const getUsers = async () => {
  const response = await apiClient.get('/users');
  return response.data;
};

export const updateUserRole = async (userId: string, role: string) => {
  const response = await apiClient.put('/users/role', { userId, role });
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
};
