import apiClient from './axiosConfig';

export const getFamilies = async (params = {}) => {
  const response = await apiClient.get('/api/families', { params });
  return response.data;
};

export const getFamilyById = async (id) => {
  const response = await apiClient.get(`/api/families/${id}`);
  return response.data;
};

export const createFamily = async (data) => {
  const response = await apiClient.post('/api/families', data);
  return response.data;
};

export const updateFamily = async (id, data) => {
  const response = await apiClient.put(`/api/families/${id}`, data);
  return response.data;
};

export const deleteFamily = async (id) => {
  const response = await apiClient.delete(`/api/families/${id}`);
  return response.data;
};

export const getFamilyStats = async () => {
  const response = await apiClient.get('/api/families/stats');
  return response.data;
};