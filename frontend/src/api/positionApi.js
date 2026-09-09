import apiClient from './axiosConfig';

export const getPositions = async (params = {}) => {
  const response = await apiClient.get('/api/positions', { params });
  return response.data;
};

export const getPositionById = async (id) => {
  const response = await apiClient.get(`/api/positions/${id}`);
  return response.data;
};

export const createPosition = async (data) => {
  const response = await apiClient.post('/api/positions', data);
  return response.data;
};

export const updatePosition = async (id, data) => {
  const response = await apiClient.put(`/api/positions/${id}`, data);
  return response.data;
};

export const deletePosition = async (id) => {
  const response = await apiClient.delete(`/api/positions/${id}`);
  return response.data;
};

export const getPositionStats = async () => {
  const response = await apiClient.get('/api/positions/stats');
  return response.data;
};