import apiClient from './axiosConfig';

// Get plans with filters
export const getPlans = async (filters = {}) => {
  const response = await apiClient.get('/api/plans', { params: filters });
  return response.data;
};

export const getPlanById = async (id) => {
  const response = await apiClient.get(`/api/plans/${id}`);
  return response.data;
};

export const createPlan = async (data) => {
  const response = await apiClient.post('/api/plans', data);
  return response.data;
};

export const updatePlan = async (id, data) => {
  const response = await apiClient.put(`/api/plans/${id}`, data);
  return response.data;
};

export const deletePlan = async (id) => {
  const response = await apiClient.delete(`/api/plans/${id}`);
  return response.data;
};

export const removeAttachment = async (id) => {
  const response = await apiClient.delete(`/api/plans/${id}/attachment`);
  return response.data;
};

export const getDocumentTypes = async () => {
  const response = await apiClient.get('/api/plans/document-types');
  return response.data;
};

export const getFilterData = async () => {
  const response = await apiClient.get('/api/plans/filter-data');
  return response.data;
};