import apiClient from './axiosConfig';

// Get full hierarchy
export const getHierarchy = async () => {
  const response = await apiClient.get('/api/hierarchy');
  return response.data;
};

// Get hierarchy for a specific cooperative
export const getCooperativeHierarchy = async (cooperativeId) => {
  const response = await apiClient.get(`/api/hierarchy/cooperative/${cooperativeId}`);
  return response.data;
};