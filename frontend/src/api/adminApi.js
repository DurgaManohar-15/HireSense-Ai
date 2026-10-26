import axiosClient from './axiosClient';

export const adminApi = {
  getQuestions: (params) => axiosClient.get('/admin/questions', { params }),
  getQuestionById: (id) => axiosClient.get(`/admin/questions/${id}`),
  createQuestion: (data) => axiosClient.post('/admin/questions', data),
  updateQuestion: (id, data) => axiosClient.put(`/admin/questions/${id}`, data),
  deactivateQuestion: (id) => axiosClient.delete(`/admin/questions/${id}`),
  createAssessment: (data) => axiosClient.post('/admin/assessments', data),
};
