import apiClient from './axiosConfig';

export const getEvents = async (params = {}) => {
  const response = await apiClient.get('/api/events', { params });
  return response.data;
};

export const getEventById = async (id) => {
  const response = await apiClient.get(`/api/events/${id}`);
  return response.data;
};

export const createEvent = async (data) => {
  const response = await apiClient.post('/api/events', data);
  return response.data;
};

export const updateEvent = async (id, data) => {
  const response = await apiClient.put(`/api/events/${id}`, data);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await apiClient.delete(`/api/events/${id}`);
  return response.data;
};