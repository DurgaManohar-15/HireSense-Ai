import axiosClient from './axiosClient';

export const assessmentApi = {
  getAvailableAssessments: () => axiosClient.get('/assessments'),
  getAssessmentById: (id) => axiosClient.get(`/assessments/${id}`),
  getAvailableTopics: () => axiosClient.get('/assessments/custom/topics'),
  checkQuestionAvailability: (data) => axiosClient.post('/assessments/custom/availability', data),
  startAssessment: (id) => axiosClient.post(`/assessments/${id}/start`),
  startCustomAssessment: (data) => axiosClient.post('/assessments/custom/start', data),
  getActiveSession: (sessionId) => axiosClient.get(`/assessment-sessions/${sessionId}`),
  saveAnswer: (sessionId, data) => axiosClient.post(`/assessment-sessions/${sessionId}/responses`, data),
  submitAssessment: (sessionId) => axiosClient.post(`/assessment-sessions/${sessionId}/submit`),
  getResultById: (resultId) => axiosClient.get(`/assessment-results/${resultId}`),
  getMyAssessmentHistory: () => axiosClient.get('/students/me/assessment-history'),
  getMyTopicPerformance: () => axiosClient.get('/students/me/topic-performance'),
};
