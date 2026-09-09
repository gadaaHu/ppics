import apiClient from './axiosConfig';

export const getCooperatives = async (params = {}) => {
  const response = await apiClient.get('/api/cooperatives', { params });
  return response.data;
};

export const getCooperativeById = async (id) => {
  const response = await apiClient.get(`/api/cooperatives/${id}`);
  return response.data;
};

export const createCooperative = async (data) => {
  const response = await apiClient.post('/api/cooperatives', data);
  return response.data;
};

export const updateCooperative = async (id, data) => {
  const response = await apiClient.put(`/api/cooperatives/${id}`, data);
  return response.data;
};

export const deleteCooperative = async (id) => {
  const response = await apiClient.delete(`/api/cooperatives/${id}`);
  return response.data;
};

export const getCooperativeStats = async () => {
  const response = await apiClient.get('/api/cooperatives/stats');
  return response.data;
};