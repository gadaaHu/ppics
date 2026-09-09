import apiClient from './axiosConfig';

// Get all news with pagination
export const getNews = async (params = {}) => {
  const response = await apiClient.get('/api/news', { params });
  return response.data;
};

// ✅ Get latest news (uses the /latest endpoint)
export const getLatestNews = async (limit = 6) => {
  const response = await apiClient.get('/api/news/latest', {
    params: { limit }
  });
  return response.data;
};

// Get news by ID
export const getNewsById = async (id) => {
  const response = await apiClient.get(`/api/news/${id}`);
  return response.data;
};

// Create news (admin only)
export const createNews = async (data) => {
  const response = await apiClient.post('/api/news', data);
  return response.data;
};

// Update news (admin only)
export const updateNews = async (id, data) => {
  const response = await apiClient.put(`/api/news/${id}`, data);
  return response.data;
};

// Delete news (admin only)
export const deleteNews = async (id) => {
  const response = await apiClient.delete(`/api/news/${id}`);
  return response.data;
};