import apiClient from './axiosConfig';

// Get all gallery images
export const getGallery = async (filters = {}) => {
  const response = await apiClient.get('/api/gallery', { params: filters });
  return response.data;
};

// Get single gallery image
export const getGalleryById = async (id) => {
  const response = await apiClient.get(`/api/gallery/${id}`);
  return response.data;
};

// Upload images
export const uploadGallery = async (formData) => {
  const response = await apiClient.post('/api/gallery/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Delete single image
export const deleteGallery = async (id) => {
  const response = await apiClient.delete(`/api/gallery/${id}`);
  return response.data;
};

// Delete by date
export const deleteGalleryByDate = async (date) => {
  const response = await apiClient.delete(`/api/gallery/date/${date}`);
  return response.data;
};

// Update image details
export const updateGallery = async (id, data) => {
  const response = await apiClient.put(`/api/gallery/${id}`, data);
  return response.data;
};