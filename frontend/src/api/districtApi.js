import apiClient from './axiosConfig';

// Get all districts
export const getDistricts = async (params = {}) => {
  const response = await apiClient.get('/api/districts', { params });
  return response.data;
};

// Get single district
export const getDistrictById = async (id) => {
  const response = await apiClient.get(`/api/districts/${id}`);
  return response.data;
};

// Create district
export const createDistrict = async (data) => {
  const response = await apiClient.post('/api/districts', data);
  return response.data;
};

// Update district
export const updateDistrict = async (id, data) => {
  const response = await apiClient.put(`/api/districts/${id}`, data);
  return response.data;
};

// Delete district
export const deleteDistrict = async (id) => {
  const response = await apiClient.delete(`/api/districts/${id}`);
  return response.data;
};

// Get district statistics
export const getDistrictStats = async () => {
  const response = await apiClient.get('/api/districts/stats');
  return response.data;
};