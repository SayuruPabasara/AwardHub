import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Guards
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public & Auth Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Voter Pages
import VoterCategoriesPage from './pages/voter/VoterCategoriesPage';
import VoterVotingPage from './pages/voter/VoterVotingPage';
import VoterHistoryPage from './pages/voter/VoterHistoryPage';
import VoterResultsPage from './pages/voter/VoterResultsPage';

// Nominee Pages
import NomineeNominationsPage from './pages/nominee/NomineeNominationsPage';
import NomineeSubmitPage from './pages/nominee/NomineeSubmitPage';
import NomineeProfilePage from './pages/nominee/NomineeProfilePage';
import NomineeFeedPage from './pages/nominee/NomineeFeedPage';

// Organizer Pages
import OrganizerDashboardPage from './pages/organizer/OrganizerDashboardPage';
import OrganizerCategoriesPage from './pages/organizer/OrganizerCategoriesPage';
import OrganizerNominationsPage from './pages/organizer/OrganizerNominationsPage';
import OrganizerJudgesPage from './pages/organizer/OrganizerJudgesPage';
import OrganizerLiveVotesPage from './pages/organizer/OrganizerLiveVotesPage';
import OrganizerReportsPage from './pages/organizer/OrganizerReportsPage';
import OrganizerAuditPage from './pages/organizer/OrganizerAuditPage';

// Judge Pages
import JudgeWorklistPage from './pages/judge/JudgeWorklistPage';
import JudgeScoringPage from './pages/judge/JudgeScoringPage';
import JudgeRankingsPage from './pages/judge/JudgeRankingsPage';
import JudgeSummaryPage from './pages/judge/JudgeSummaryPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminITPage from './pages/admin/AdminITPage';
import AdminAuditPage from './pages/admin/AdminAuditPage';
import AdminHealthPage from './pages/admin/AdminHealthPage';

// Shared (cross-role) Pages
import FeedbackPage from './pages/shared/FeedbackPage';
import RoleReportsPage from './pages/shared/RoleReportsPage';
import OrganizerFeedbackPage from './pages/organizer/OrganizerFeedbackPage';

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Voter Portal (accessible to VOTER, ORGANIZER, ADMIN) */}
      <Route element={<ProtectedRoute allowedRoles={['VOTER', 'ORGANIZER', 'ADMIN', 'NOMINEE', 'JUDGE']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/voter" element={<Navigate to="/voter/categories" replace />} />
          <Route path="/voter/categories" element={<VoterCategoriesPage />} />
          <Route path="/voter/vote" element={<VoterVotingPage />} />
          <Route path="/voter/history" element={<VoterHistoryPage />} />
          <Route path="/voter/results" element={<VoterResultsPage />} />
        </Route>
      </Route>

      {/* Nominee Portal */}
      <Route element={<ProtectedRoute allowedRoles={['NOMINEE', 'ORGANIZER', 'ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/nominee" element={<Navigate to="/nominee/nominations" replace />} />
          <Route path="/nominee/nominations" element={<NomineeNominationsPage />} />
          <Route path="/nominee/submit" element={<NomineeSubmitPage />} />
          <Route path="/nominee/profile" element={<NomineeProfilePage />} />
          <Route path="/nominee/feed" element={<NomineeFeedPage />} />
        </Route>
      </Route>

      {/* Organizer Portal */}
      <Route element={<ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/organizer" element={<Navigate to="/organizer/dashboard" replace />} />
          <Route path="/organizer/dashboard" element={<OrganizerDashboardPage />} />
          <Route path="/organizer/categories" element={<OrganizerCategoriesPage />} />
          <Route path="/organizer/nominations" element={<OrganizerNominationsPage />} />
          <Route path="/organizer/judges" element={<OrganizerJudgesPage />} />
          <Route path="/organizer/votes" element={<OrganizerLiveVotesPage />} />
          <Route path="/organizer/reports" element={<OrganizerReportsPage />} />
          <Route path="/organizer/feedback" element={<OrganizerFeedbackPage />} />
          <Route path="/organizer/audit" element={<OrganizerAuditPage />} />
        </Route>
      </Route>

      {/* Judge Portal */}
      <Route element={<ProtectedRoute allowedRoles={['JUDGE', 'ORGANIZER', 'ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/judge" element={<Navigate to="/judge/worklist" replace />} />
          <Route path="/judge/worklist" element={<JudgeWorklistPage />} />
          <Route path="/judge/scoring" element={<JudgeScoringPage />} />
          <Route path="/judge/rankings" element={<JudgeRankingsPage />} />
          <Route path="/judge/summary" element={<JudgeSummaryPage />} />
        </Route>
      </Route>

      {/* Admin Portal */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'IT_COORDINATOR']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/it" element={<AdminITPage />} />
          <Route path="/admin/audit" element={<AdminAuditPage />} />
          <Route path="/admin/health" element={<AdminHealthPage />} />
        </Route>
      </Route>

      {/* Shared: Feedback (every authenticated role) */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={['VOTER', 'NOMINEE', 'JUDGE', 'ORGANIZER', 'ADMIN', 'IT_COORDINATOR']}
          />
        }
      >
        <Route element={<DashboardLayout />}>
          <Route path="/feedback" element={<FeedbackPage />} />
        </Route>
      </Route>

      {/* Shared: Role-scoped reports (backend filters by role) */}
      <Route element={<ProtectedRoute allowedRoles={['VOTER', 'NOMINEE', 'JUDGE']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/reports" element={<RoleReportsPage />} />
        </Route>
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
