import axiosClient from './axiosClient';

export const platformApi = {
  // Unified Dashboard
  getStudentDashboard: () => axiosClient.get('/dashboard/student'),

  // Notifications
  getMyNotifications: () => axiosClient.get('/notifications'),
  getUnreadNotificationsCount: () => axiosClient.get('/notifications/unread-count'),
  markNotificationAsRead: (id) => axiosClient.put(`/notifications/${id}/read`),
  markAllNotificationsAsRead: () => axiosClient.put('/notifications/read-all'),

  // Announcements
  getActiveAnnouncements: () => axiosClient.get('/announcements'),
  getAllAnnouncementsAdmin: () => axiosClient.get('/announcements/admin'),
  createAnnouncementAdmin: (data) => axiosClient.post('/announcements', data),
  deactivateAnnouncementAdmin: (id) => axiosClient.delete(`/announcements/${id}`),

  // AI Career Assistant
  careerChat: (message, conversationId = null) =>
    axiosClient.post('/career-assistant/chat', { message, conversationId }),
  getLatestCareerConversation: () => axiosClient.get('/career-assistant/conversation'),
  getCareerConversation: (id) => axiosClient.get(`/career-assistant/conversation/${id}`),

  // Target Roles
  getTargetRoles: () => axiosClient.get('/target-roles'),

  // Admin Student Management & Cohort Analytics
  searchStudentsAdmin: (params = {}) => {
    const query = new URLSearchParams();
    if (params.query) query.append('query', params.query);
    if (params.targetRole) query.append('targetRole', params.targetRole);
    if (params.company) query.append('company', params.company);
    if (params.band) query.append('band', params.band);
    if (params.page !== undefined) query.append('page', params.page);
    if (params.size !== undefined) query.append('size', params.size);
    return axiosClient.get(`/admin/students?${query.toString()}`);
  },
  getStudentDetailAdmin: (id) => axiosClient.get(`/admin/students/${id}`),
  getCohortAnalyticsAdmin: () => axiosClient.get('/admin/students/cohort-analytics'),

  // Admin Audit Logs
  getAuditLogsAdmin: (page = 0, size = 30) =>
    axiosClient.get(`/admin/audit-logs?page=${page}&size=${size}`),
};
