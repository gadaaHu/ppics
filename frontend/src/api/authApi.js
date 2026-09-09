import apiClient from './axiosConfig';

// Login - Supports both users and members
export const login = async (credentials) => {
  const response = await apiClient.post('/api/auth/login', credentials);
  return response.data;
};

// Register user (admin only)
export const register = async (userData) => {
  const response = await apiClient.post('/api/auth/register', userData);
  return response.data;
};

// Get user profile
export const getProfile = async () => {
  const response = await apiClient.get('/api/auth/profile');
  return response.data;
};

// Update user profile
export const updateProfile = async (data) => {
  const response = await apiClient.put('/api/auth/profile', data);
  return response.data;
};

// Change password for user
export const changeUserPassword = async (data) => {
  const response = await apiClient.put('/api/auth/change-password/user', data);
  return response.data;
};

// Change password for member
export const changeMemberPassword = async (data) => {
  const response = await apiClient.put('/api/auth/change-password/member', data);
  return response.data;
};

// Logout
export const logout = async () => {
  const response = await apiClient.post('/api/auth/logout');
  return response.data;
};

// Get all users (admin only)
export const getUsers = async () => {
  const response = await apiClient.get('/api/auth/users');
  return response.data;
};

// Get all members (admin only)
export const getMembersList = async () => {
  const response = await apiClient.get('/api/auth/members-list');
  return response.data;
};

// Reset member password (admin only)
export const resetMemberPassword = async (memberId) => {
  const response = await apiClient.put(`/api/auth/reset-password/${memberId}`);
  return response.data;
};