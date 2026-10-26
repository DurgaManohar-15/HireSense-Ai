import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { OAuthCallbackPage } from './pages/auth/OAuthCallbackPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Student Core & Readiness
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { ReadinessDashboardPage } from './pages/student/readiness/ReadinessDashboardPage';
import { ReadinessHistoryPage } from './pages/student/readiness/ReadinessHistoryPage';
import { SkillGapPage } from './pages/student/readiness/SkillGapPage';
import { RoadmapPage } from './pages/student/readiness/RoadmapPage';
import { CareerAssistantPage } from './pages/student/assistant/CareerAssistantPage';
import { NotificationPage } from './pages/student/notifications/NotificationPage';
import OnboardingPage from './pages/student/OnboardingPage';

// Assessment & Interview
import { AssessmentListPage } from './pages/student/assessment/AssessmentListPage';
import { AssessmentInterfacePage } from './pages/student/assessment/AssessmentInterfacePage';
import { AssessmentResultPage } from './pages/student/assessment/AssessmentResultPage';
import { AssessmentHistoryPage } from './pages/student/assessment/AssessmentHistoryPage';
import { InterviewHubPage } from './pages/student/interview/InterviewHubPage';
import { InterviewRoomPage } from './pages/student/interview/InterviewRoomPage';
import { InterviewResultPage } from './pages/student/interview/InterviewResultPage';
import { InterviewHistoryPage } from './pages/student/interview/InterviewHistoryPage';

// Resume & Cover Letters
import { ResumeUploadPage } from './pages/student/resume/ResumeUploadPage';
import { ResumeAnalysisPage } from './pages/student/resume/ResumeAnalysisPage';
import { ResumeHistoryPage } from './pages/student/resume/ResumeHistoryPage';
import { ResumeBuilderPage } from './pages/student/resume/ResumeBuilderPage';
import { ResumeTailoringPage } from './pages/student/resume/ResumeTailoringPage';
import { CoverLetterPage } from './pages/student/coverletter/CoverLetterPage';

// Jobs & Applications
import { JobSearchPage } from './pages/student/jobs/JobSearchPage';
import { JobDetailsPage } from './pages/student/jobs/JobDetailsPage';
import { SavedJobsPage } from './pages/student/jobs/SavedJobsPage';
import { ApplicationTrackerPage } from './pages/student/applications/ApplicationTrackerPage';

// Practice Hubs
import { CodingPracticePage } from './pages/student/coding/CodingPracticePage';
import { CodingIdePage } from './pages/student/coding/CodingIdePage';
import AptitudePracticePage from './pages/student/aptitude/AptitudePracticePage';
import CompanyPrepPage from './pages/student/company/CompanyPrepPage';

// Documents & Settings
import DocumentsPage from './pages/student/documents/DocumentsPage';
import SettingsPage from './pages/student/settings/SettingsPage';
import { StudentAnnouncementsPage } from './pages/student/StudentAnnouncementsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminAnnouncementsPage } from './pages/admin/AdminAnnouncementsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminQuestionsPage } from './pages/admin/AdminQuestionsPage';
import { AdminResearchPage } from './pages/admin/AdminResearchPage';

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />

          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Core & Cockpit */}
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/profile" element={<StudentProfilePage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/readiness" element={<ReadinessDashboardPage />} />
            <Route path="/readiness/history" element={<ReadinessHistoryPage />} />
            <Route path="/skill-gaps" element={<SkillGapPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/career-assistant" element={<CareerAssistantPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/announcements" element={<StudentAnnouncementsPage />} />

            {/* Resume & Applications */}
            <Route path="/resume" element={<ResumeUploadPage />} />
            <Route path="/resume/builder" element={<ResumeBuilderPage />} />
            <Route path="/resume/tailor" element={<ResumeTailoringPage />} />
            <Route path="/resume/history" element={<ResumeHistoryPage />} />
            <Route path="/resume/analysis/:resumeId" element={<ResumeAnalysisPage />} />
            <Route path="/cover-letters" element={<CoverLetterPage />} />
            <Route path="/applications" element={<ApplicationTrackerPage />} />

            {/* Jobs Discovery */}
            <Route path="/jobs" element={<JobSearchPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/saved-jobs" element={<SavedJobsPage />} />

            {/* Practice & Preparation */}
            <Route path="/coding" element={<CodingPracticePage />} />
            <Route path="/coding/:id" element={<CodingIdePage />} />
            <Route path="/aptitude" element={<AptitudePracticePage />} />
            <Route path="/company-prep" element={<CompanyPrepPage />} />
            <Route path="/interview" element={<InterviewHubPage />} />
            <Route path="/interview/:id/room" element={<InterviewRoomPage />} />
            <Route path="/interview/results/:id" element={<InterviewResultPage />} />
            <Route path="/interview/history" element={<InterviewHistoryPage />} />
            <Route path="/assessments" element={<AssessmentListPage />} />
            <Route path="/assessments/:sessionId/take" element={<AssessmentInterfacePage />} />
            <Route path="/assessments/session/:sessionId" element={<AssessmentInterfacePage />} />
            <Route path="/assessments/results/:resultId" element={<AssessmentResultPage />} />
            <Route path="/assessments/history" element={<AssessmentHistoryPage />} />

            {/* Documents & Settings */}
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<AdminStudentsPage />} />
            <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="/admin/research" element={<AdminResearchPage />} />
            <Route path="/admin/questions" element={<AdminQuestionsPage />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
