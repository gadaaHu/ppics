import apiClient from './axiosConfig';

// Get member profile
export const getMemberProfile = async () => {
    const response = await apiClient.get('/api/member/profile');
    return response.data;
};

// Update member profile
export const updateMemberProfile = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
        }
    });
    
    const response = await apiClient.put('/api/member/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// Upload profile photo
export const uploadProfilePhoto = async (photo) => {
    const formData = new FormData();
    formData.append('photo', photo);
    
    const response = await apiClient.post('/api/member/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// Change password
export const changeMemberPassword = async (data) => {
    const response = await apiClient.put('/api/member/profile/password', data);
    return response.data;
};

// Get member stats
export const getMemberStats = async () => {
    const response = await apiClient.get('/api/member/profile/stats');
    return response.data;
};