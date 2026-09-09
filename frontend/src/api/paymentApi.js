import apiClient from './axiosConfig';

export const getPayments = async () => {
  const response = await apiClient.get('/api/payments');
  return response.data;
};

export const getMemberPayments = async () => {
  const response = await apiClient.get('/api/payments/my-payments');
  return response.data;
};

export const createPayment = async (data) => {
  const response = await apiClient.post('/api/payments', data);
  return response.data;
};

export const approvePayment = async (id) => {
  const response = await apiClient.put(`/api/payments/${id}/approve`);
  return response.data;
};

export const deletePayment = async (id) => {
  const response = await apiClient.delete(`/api/payments/${id}`);
  return response.data;
};
