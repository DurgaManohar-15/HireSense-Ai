import axiosClient from './axiosClient';

export const resumeApi = {
  uploadResume: (formData) =>
    axiosClient.post('/resumes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  getMyResumes: () => axiosClient.get('/resumes'),
  getResumeById: (id) => axiosClient.get(`/resumes/${id}`),
  downloadResumeUrl: (id) => `/api/v1/resumes/${id}/download`,
  analyzeResume: (id, payload) => axiosClient.post(`/resumes/${id}/analyze`, payload || {}),
  getResumeAnalysis: (id) => axiosClient.get(`/resumes/${id}/analysis`),
  getAnalysisHistory: () => axiosClient.get('/resumes/analyses/history'),
  getJdAnalysisHistory: () => axiosClient.get('/resumes/jd-analyses'),
  getJdAnalysisById: (id) => axiosClient.get(`/resumes/jd-analyses/${id}`),
  compareAnalyses: (analysisAId, analysisBId) =>
    axiosClient.get(`/resumes/jd-analyses/compare?analysisAId=${analysisAId}&analysisBId=${analysisBId}`),
  updateSuggestionStatus: (suggestionId, payload) =>
    axiosClient.patch(`/resumes/suggestions/${suggestionId}`, payload),
  createJobDescription: (payload) => axiosClient.post('/resumes/job-descriptions', payload),
  getMyJobDescriptions: () => axiosClient.get('/resumes/job-descriptions'),
  getJobDescriptionById: (id) => axiosClient.get(`/resumes/job-descriptions/${id}`),
  deleteJobDescription: (id) => axiosClient.delete(`/resumes/job-descriptions/${id}`),
  deleteResume: (id) => axiosClient.delete(`/resumes/${id}`),
};
