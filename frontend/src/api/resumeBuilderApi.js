import axiosClient from './axiosClient';

export const resumeBuilderApi = {
  getMyResumeVersions: () => axiosClient.get('/resume-versions').then((res) => res.data),
  getResumeVersionById: (id) => axiosClient.get(`/resume-versions/${id}`).then((res) => res.data),
  createResumeVersion: (data) => axiosClient.post('/resume-versions', data).then((res) => res.data),
  updateResumeVersion: (id, data) => axiosClient.put(`/resume-versions/${id}`, data).then((res) => res.data),
  deleteResumeVersion: (id) => axiosClient.delete(`/resume-versions/${id}`).then((res) => res.data),
  chatWithResumeAgent: (data) => axiosClient.post('/resume-versions/ai-agent', data).then((res) => res.data),
  tailorResume: (data) => axiosClient.post('/resume-versions/tailor', data).then((res) => res.data),
};
