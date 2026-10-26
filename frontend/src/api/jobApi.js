import axiosClient from './axiosClient';

export const jobApi = {
  searchJobs: (params) => axiosClient.get('/jobs', { params }).then((res) => res.data),
  getJobById: (id) => axiosClient.get(`/jobs/${id}`).then((res) => res.data),
  toggleSaveJob: (id) => axiosClient.post(`/jobs/${id}/save`).then((res) => res.data),
  getSavedJobs: () => axiosClient.get('/jobs/saved').then((res) => res.data),
  getJobMatch: (id) => axiosClient.get(`/jobs/${id}/match`).then((res) => res.data),
};
