import apiClient from './axiosConfig';

export const markAttendance = async (data) => {
  const response = await apiClient.post('/api/attendance/mark', data);
  return response.data;
};

export const scanBarcode = async (data) => {
  const response = await apiClient.post('/api/attendance/scan', data);
  return response.data;
};

export const getAttendanceByEvent = async (eventId) => {
  const response = await apiClient.get(`/api/attendance/event/${eventId}`);
  return response.data;
};

export const getAttendanceByMember = async (memberId) => {
  const response = await apiClient.get(`/api/attendance/member/${memberId}`);
  return response.data;
};

export const getAttendanceStats = async () => {
  const response = await apiClient.get('/api/attendance/stats');
  return response.data;
};