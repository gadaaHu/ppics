import apiClient from './axiosConfig';

export const getUsers = async () => {
  const response = await apiClient.get('/api/users');
  return response.data;
};

export const createUser = async (userData) => {
  const response = await apiClient.post('/api/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await apiClient.put(`/api/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/api/users/${id}`);
  return response.data;
};

