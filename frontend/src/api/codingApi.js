import axiosClient from './axiosClient';

export const codingApi = {
  getProblems: (params) => axiosClient.get('/coding/problems', { params }).then((res) => res.data),
  getProblemById: (id) => axiosClient.get(`/coding/problems/${id}`).then((res) => res.data),
  runCode: (id, data) => axiosClient.post(`/coding/problems/${id}/run`, data).then((res) => res.data),
  submitCode: (id, data) => axiosClient.post(`/coding/problems/${id}/submit`, data).then((res) => res.data),
  getCodingStats: () => axiosClient.get('/coding/stats').then((res) => res.data),
  getRoleQuestions: (params) => axiosClient.get('/coding/role-questions', { params }).then((res) => res.data),
};
