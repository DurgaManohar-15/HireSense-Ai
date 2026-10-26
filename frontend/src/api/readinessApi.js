import axiosClient from './axiosClient';

export const readinessApi = {
  // Placement Readiness Score (PRS)
  getLatestReadiness: () => axiosClient.get('/readiness'),
  recalculateReadiness: () => axiosClient.post('/readiness/recalculate'),
  getReadinessHistory: () => axiosClient.get('/readiness/history'),

  // Skill Gaps
  getSkillGaps: () => axiosClient.get('/skill-gaps'),
  getCompanySkillGaps: (companyId) => axiosClient.get(`/skill-gaps/company/${companyId}`),
  analyzeJdSkillGap: (data) => axiosClient.post('/skill-gaps/analyze-jd', data),
  getStudentSkills: () => axiosClient.get('/skill-gaps/student-skills'),

  // Personalized Roadmap
  generateRoadmap: (data) => axiosClient.post('/roadmaps/generate', data),
  getCurrentRoadmap: () => axiosClient.get('/roadmaps/current'),
  getRoadmapHistory: () => axiosClient.get('/roadmaps/history'),
  updateRoadmapTaskStatus: (taskId, completed, skipped = false) =>
    axiosClient.put(`/roadmaps/tasks/${taskId}/status?completed=${completed}&skipped=${skipped}`),

  // Research Analytics (Admin)
  getCohortResearchMetrics: () => axiosClient.get('/admin/research/cohort-metrics'),
  getAnonymizedResearchRecords: () => axiosClient.get('/admin/research/records'),
};
