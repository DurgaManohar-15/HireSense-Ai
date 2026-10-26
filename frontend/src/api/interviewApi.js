import axiosClient from './axiosClient';

export const interviewApi = {
  startInterview: (data) => axiosClient.post('/interviews', data),
  getInterviewSession: (id) => axiosClient.get(`/interviews/${id}`),
  submitAnswer: (id, data) => axiosClient.post(`/interviews/${id}/answers`, data),
  getFinalReport: (id) => axiosClient.get(`/interviews/${id}/report`),
  getMyInterviewHistory: () => axiosClient.get('/interviews/history'),
};
