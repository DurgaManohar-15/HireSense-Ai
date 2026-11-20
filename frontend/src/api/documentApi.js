import axiosClient from './axiosClient';

export const documentApi = {
  getDocuments: () => axiosClient.get('/documents').then((res) => res.data),
  getMyDocuments: () => axiosClient.get('/documents').then((res) => res.data),
  createDocument: (data) => axiosClient.post('/documents', data).then((res) => res.data),
  uploadDocument: (formData) =>
    axiosClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data),
  downloadDocumentBlob: (id) =>
    axiosClient.get(`/documents/${id}/download`, {
      responseType: 'blob',
    }).then((res) => res.data),
  deleteDocument: (id) => axiosClient.delete(`/documents/${id}`).then((res) => res.data),
};
