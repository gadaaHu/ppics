import apiClient from './axiosConfig';

// Get document types
export const getDocumentTypes = async () => {
  const response = await apiClient.get('/api/documents/types');
  return response.data;
};

// Get families in cooperative
export const getFamilies = async (cooperativeId) => {
  const response = await apiClient.get(`/api/documents/families/${cooperativeId}`);
  return response.data;
};

// Get cooperative level documents
export const getCooperativeDocuments = async (cooperativeId) => {
  const response = await apiClient.get(`/api/documents/cooperative/${cooperativeId}`);
  return response.data;
};

// Get family documents
export const getFamilyDocuments = async (familyId) => {
  const response = await apiClient.get(`/api/documents/family/${familyId}`);
  return response.data;
};

// Add family document
export const addFamilyDocument = async (data) => {
  const formData = new FormData();
  formData.append('family_id', data.family_id);
  formData.append('cooperative_id', data.cooperative_id);
  formData.append('title', data.title);
  formData.append('description', data.description || '');
  formData.append('date', data.date);
  formData.append('document_type_id', data.document_type_id);
  if (data.attachment) {
    formData.append('attachment', data.attachment);
  }
  
  const response = await apiClient.post('/api/documents/family', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Update family document
export const updateFamilyDocument = async (data) => {
  const formData = new FormData();
  formData.append('id', data.id);
  formData.append('title', data.title);
  formData.append('description', data.description || '');
  formData.append('date', data.date);
  formData.append('document_type_id', data.document_type_id);
  if (data.attachment) {
    formData.append('attachment', data.attachment);
  }
  
  const response = await apiClient.put(`/api/documents/family/${data.id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Delete family document
export const deleteFamilyDocument = async (id) => {
  const response = await apiClient.delete(`/api/documents/family/${id}`);
  return response.data;
};

// Add cooperative document (leader only)
export const addCooperativeDocument = async (data) => {
  const formData = new FormData();
  formData.append('cooperative_id', data.cooperative_id);
  formData.append('title', data.title);
  formData.append('description', data.description || '');
  formData.append('date', data.date);
  formData.append('document_type_id', data.document_type_id);
  if (data.attachment) {
    formData.append('attachment', data.attachment);
  }
  
  const response = await apiClient.post('/api/documents/cooperative', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Update cooperative document (leader only)
export const updateCooperativeDocument = async (data) => {
  const formData = new FormData();
  formData.append('id', data.id);
  formData.append('title', data.title);
  formData.append('description', data.description || '');
  formData.append('date', data.date);
  formData.append('document_type_id', data.document_type_id);
  if (data.attachment) {
    formData.append('attachment', data.attachment);
  }
  
  const response = await apiClient.put(`/api/documents/cooperative/${data.id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Delete cooperative document (leader only)
export const deleteCooperativeDocument = async (id) => {
  const response = await apiClient.delete(`/api/documents/cooperative/${id}`);
  return response.data;
};