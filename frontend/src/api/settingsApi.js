import apiClient from './axiosConfig';

export const getSettings = async () => {
  const response = await apiClient.get('/api/settings');
  return response.data;
};

export const updateSettings = async (settingsData) => {
  const response = await apiClient.put('/api/settings', settingsData);
  return response.data;
};
