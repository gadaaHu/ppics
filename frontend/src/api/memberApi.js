import apiClient from './axiosConfig';

// Get all members
export const getMembers = async (params = {}) => {
    const response = await apiClient.get('/api/members', { params });
    return response.data;
};

// Get single member
export const getMemberById = async (id) => {
    const response = await apiClient.get(`/api/members/${id}`);
    return response.data;
};

// Create member (with file upload)
export const createMember = async (data) => {
    // If data is FormData, send directly
    if (data instanceof FormData) {
        const response = await apiClient.post('/api/members', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
    
    // Otherwise, send as JSON
    const response = await apiClient.post('/api/members', data);
    return response.data;
};

// Update member (with file upload)
export const updateMember = async (id, data) => {
    // If data is FormData, send directly
    if (data instanceof FormData) {
        const response = await apiClient.put(`/api/members/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
    
    // Otherwise, send as JSON
    const response = await apiClient.put(`/api/members/${id}`, data);
    return response.data;
};

// Delete member
export const deleteMember = async (id) => {
    const response = await apiClient.delete(`/api/members/${id}`);
    return response.data;
};

// Approve member
export const approveMember = async (id) => {
    const response = await apiClient.put(`/api/members/${id}/approve`);
    return response.data;
};

// Get dropdown data
export const getDropdownData = async () => {
    const response = await apiClient.get('/api/members/dropdown');
    return response.data;
};

// Get cooperatives by district
export const getCooperativesByDistrict = async (districtId) => {
    const response = await apiClient.get(`/api/members/cooperatives/${districtId}`);
    return response.data;
};

// Get families by cooperative
export const getFamiliesByCooperative = async (cooperativeId) => {
    const response = await apiClient.get(`/api/members/families/${cooperativeId}`);
    return response.data;
};