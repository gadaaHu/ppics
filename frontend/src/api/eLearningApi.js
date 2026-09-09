import apiClient from './axiosConfig';

// Get all e-learning materials
export const getELearningMaterials = async (params = {}) => {
    const response = await apiClient.get('/api/e-learning', { params });
    return response.data;
};

// Get single e-learning material
export const getELearningMaterialById = async (id) => {
    const response = await apiClient.get(`/api/e-learning/${id}`);
    return response.data;
};

// Get e-learning categories
export const getELearningCategories = async () => {
    const response = await apiClient.get('/api/e-learning/categories');
    return response.data;
};

// Get e-learning statistics
export const getELearningStats = async () => {
    const response = await apiClient.get('/api/e-learning/stats');
    return response.data;
};

// Create e-learning material (admin only)
// Expects data to already be FormData
export const createELearningMaterial = async (data) => {
    const response = await apiClient.post('/api/e-learning', data, {
        headers: { 
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// Update e-learning material (admin only)
// Expects data to already be FormData
export const updateELearningMaterial = async (id, data) => {
    // Add _method for PUT override since HTML forms don't support PUT with FormData
    data.append('_method', 'PUT');
    
    const response = await apiClient.post(`/api/e-learning/${id}`, data, {
        headers: { 
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// Delete e-learning material (admin only)
export const deleteELearningMaterial = async (id) => {
    const response = await apiClient.delete(`/api/e-learning/${id}`);
    return response.data;
};