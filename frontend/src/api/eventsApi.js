import apiClient from './axiosConfig';

// Get all events with pagination
export const getEvents = async (params = {}) => {
  const { limit = 6, page = 1 } = params;
  const response = await apiClient.get('/api/events', {
    params: { limit, page }
  });
  return response.data;
};

// Get upcoming events
export const getUpcomingEvents = async (limit = 3) => {
  const response = await apiClient.get('/api/events/upcoming', {
    params: { limit }
  });
  return response.data;
};

// Get single event by ID
export const getEventById = async (id) => {
  const response = await apiClient.get(`/api/events/${id}`);
  return response.data;
};

// Create event (admin only)
export const createEvent = async (data) => {
  const response = await apiClient.post('/api/events', data);
  return response.data;
};

// Update event (admin only)
export const updateEvent = async (id, data) => {
  const response = await apiClient.put(`/api/events/${id}`, data);
  return response.data;
};

// Delete event (admin only)
export const deleteEvent = async (id) => {
  const response = await apiClient.delete(`/api/events/${id}`);
  return response.data;
};