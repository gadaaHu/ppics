import apiClient from './axiosConfig';

export const getEvaluations = async () => {
  const response = await apiClient.get('/api/evaluations');
  return response.data;
};

export const createEvaluation = async (data) => {
  const response = await apiClient.post('/api/evaluations', data);
  return response.data;
};

export const updateEvaluation = async (id, data) => {
  const response = await apiClient.put(`/api/evaluations/${id}`, data);
  return response.data;
};

export const getMemberEvaluations = async (memberId) => {
  const response = await apiClient.get(`/api/evaluations/member/${memberId}`);
  return response.data;
};

export const deleteEvaluation = async (id) => {
  const response = await apiClient.delete(`/api/evaluations/${id}`);
  return response.data;
};

export const approveEvaluation = async (id) => {
  const response = await apiClient.put(`/api/evaluations/${id}/approve`);
  return response.data;
};
