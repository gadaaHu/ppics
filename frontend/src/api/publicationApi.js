import apiClient from './axiosConfig';

// Get all publications
export const getPublications = async (params = {}) => {
    const response = await apiClient.get('/api/publications', { params });
    return response.data;
};

// Get single publication
export const getPublicationById = async (id) => {
    const response = await apiClient.get(`/api/publications/${id}`);
    return response.data;
};

// Get publication categories
export const getPublicationCategories = async () => {
    const response = await apiClient.get('/api/publications/categories');
    return response.data;
};

// Create publication (admin only)
export const createPublication = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
        }
    });
    
    const response = await apiClient.post('/api/publications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// Update publication (admin only)
export const updatePublication = async (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
        }
    });
    
    const response = await apiClient.put(`/api/publications/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// Delete publication (admin only)
export const deletePublication = async (id) => {
    const response = await apiClient.delete(`/api/publications/${id}`);
    return response.data;
};