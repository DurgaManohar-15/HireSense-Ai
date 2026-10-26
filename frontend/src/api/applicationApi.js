import axiosClient from './axiosClient';

export const applicationApi = {
  getMyApplications: () => axiosClient.get('/applications').then((res) => res.data),
  getApplicationById: (id) => axiosClient.get(`/applications/${id}`).then((res) => res.data),
  createApplication: (data) => axiosClient.post('/applications', data).then((res) => res.data),
  updateStatus: (id, status, notes) => axiosClient.patch(`/applications/${id}/status`, { status, notes }).then((res) => res.data),
  updateApplication: (id, data) => axiosClient.put(`/applications/${id}`, data).then((res) => res.data),
  deleteApplication: (id) => axiosClient.delete(`/applications/${id}`).then((res) => res.data),
  getAnalytics: () => axiosClient.get('/applications/analytics').then((res) => res.data),
};
