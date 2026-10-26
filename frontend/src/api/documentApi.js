import axiosClient from './axiosClient';

export const documentApi = {
  getMyDocuments: () => axiosClient.get('/documents').then((res) => res.data),
  createDocument: (data) => axiosClient.post('/documents', data).then((res) => res.data),
  deleteDocument: (id) => axiosClient.delete(`/documents/${id}`).then((res) => res.data),
};
