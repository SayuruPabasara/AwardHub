import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import feedbackApi from '../services/feedbackApi';
import reportsApi from '../services/reportsApi';
import analyticsApi from '../services/analyticsApi';
import {
  initialEvents,
  initialCategories,
  initialUsers,
  initialNominations,
  initialJudgeScores,
  initialVotes,
  initialAuditLogs,
  initialFeedback
} from '../data/initialData';

const AwardHubContext = createContext(null);

const STORAGE_KEY = 'awardhub_v1_state';
const AUTH_KEY = 'awardhub_auth_session';

// Map role to standard seeded backend user ID
export const ROLE_TO_USER_ID = {
  admin: 1,
  organizer: 2,
  nominee: 3,
  judge: 4,
  voter: 6
};

export function AwardHubProvider({ children }) {
  // Load state from localStorage or initial seed
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          reports: parsed.reports || [],
          analyticsSnapshots: parsed.analyticsSnapshots || []
        };
      }
    } catch (e) {
      console.warn('Failed to parse localStorage state', e);
    }
    return {
      events: initialEvents,
      categories: initialCategories,
      users: initialUsers,
      nominations: initialNominations,
      judgeScores: initialJudgeScores,
      votes: initialVotes,
      auditLogs: initialAuditLogs,
      feedback: initialFeedback,
      reports: [],
      analyticsSnapshots: []
    };
  });

  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const session = localStorage.getItem(AUTH_KEY);
    return session ? true : true; // Default to true with instant session, supports logout
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const session = localStorage.getItem(AUTH_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        return parsed.role || 'organizer';
      }
    } catch (e) {}
    return 'organizer'; // 'organizer' | 'nominee' | 'judge' | 'voter' | 'admin'
  });

  // Theme State ('light' | 'dark') with system preference & persistence
  const [theme, setThemeState] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('awardhub_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {}
    return 'light';
  });

  // Sync dark class on <html> document element and <body>
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      if (body) body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      if (body) body.classList.remove('dark');
    }
    try {
      localStorage.setItem('awardhub_theme', theme);
    } catch (e) {}
  }, [theme]);

  // Core Function Navigation State (Left Panel Tabs)
  const [activeCoreTab, setActiveCoreTab] = useState('categories');
  const [blindReviewEnabled, setBlindReviewEnabled] = useState(true);
  const [toast, setToast] = useState(null);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
      return next;
    });
  };

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [state]);

  // Feedback Normalizer
  const normalizeFeedback = useCallback((f) => {
    if (!f) return null;
    let inferredRole = 'VOTER';
    if (f.userId === 1) inferredRole = 'ADMIN';
    else if (f.userId === 2) inferredRole = 'ORGANIZER';
    else if (f.userId === 3) inferredRole = 'NOMINEE';
    else if (f.userId === 4 || f.userId === 5) inferredRole = 'JUDGE';

    const repliesList = Array.isArray(f.replies) ? f.replies : [];

    return {
      id: f.id,
      userId: f.userId,
      submittedBy: f.username || f.submittedBy || 'Stakeholder',
      userRole: f.userRole || inferredRole,
      rating: typeof f.rating === 'number' ? f.rating : 5,
      category: f.subject || f.category || 'General',
      subject: f.subject || f.category || 'General',
      comment: f.message || f.comment || '',
      message: f.message || f.comment || '',
      feedbackType: (f.feedbackType || 'SUGGESTION').toUpperCase(),
      status: (f.status || 'OPEN').toUpperCase(),
      categoryId: f.categoryId || null,
      submittedAt: f.createdAt || f.submittedAt || new Date().toISOString(),
      createdAt: f.createdAt || f.submittedAt || new Date().toISOString(),
      updatedAt: f.updatedAt || f.submittedAt || new Date().toISOString(),
      replies: repliesList.map((r) => ({
        id: r.id,
        repliedById: r.repliedById,
        repliedByName: r.repliedByName || 'Organizer/Admin',
        message: r.message || '',
        repliedAt: r.repliedAt
      }))
    };
  }, []);

  // Fetch feedback from backend
  const loadFeedback = useCallback(async () => {
    try {
      const list = await feedbackApi.getAll();
      if (Array.isArray(list)) {
        const mapped = list.map(normalizeFeedback).filter(Boolean);
        setState((prev) => ({ ...prev, feedback: mapped }));
      }
    } catch (err) {
      console.warn('Could not load feedback from backend:', err.message);
    }
  }, [normalizeFeedback]);

  // Fetch reports from backend
  const loadReports = useCallback(async () => {
    try {
      const list = await reportsApi.getAll();
      setState((prev) => ({ ...prev, reports: list || [] }));
    } catch (err) {
      console.warn('Could not load reports from backend:', err.message);
    }
  }, []);

  // Fetch analytics snapshots from backend
  const loadAnalyticsSnapshots = useCallback(async () => {
    try {
      const list = await analyticsApi.getAll();
      setState((prev) => ({ ...prev, analyticsSnapshots: list || [] }));
    } catch (err) {
      console.warn('Could not load analytics snapshots from backend:', err.message);
    }
  }, []);

  // Load backend reporting, analytics & feedback data on mount
  useEffect(() => {
    loadFeedback();
    loadReports();
    loadAnalyticsSnapshots();
  }, [loadFeedback, loadReports, loadAnalyticsSnapshots]);

  // Current logged in user object based on active role
  const currentUser = React.useMemo(() => {
    return state.users.find((u) => u.role === currentRole) || state.users[0];
  }, [currentRole, state.users]);

  // Sync auth session
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      localStorage.setItem(AUTH_KEY, JSON.stringify({
        userId: currentUser.id,
        role: currentRole
      }));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [isAuthenticated, currentRole, currentUser]);

  // Audit Log Helper
  const logAudit = (action, module, targetId, details) => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser?.name || 'System User',
      role: currentRole.toUpperCase(),
      module,
      action,
      targetId,
      details
    };
    setState((prev) => ({
      ...prev,
      auditLogs: [newLog, ...prev.auditLogs]
    }));
  };

  // Auth Operations
  const login = (roleOrUser) => {
    let targetRole = 'organizer';
    if (typeof roleOrUser === 'string') {
      targetRole = roleOrUser;
    } else if (roleOrUser?.role) {
      targetRole = roleOrUser.role;
    }

    setCurrentRole(targetRole);
    setIsAuthenticated(true);

    if (targetRole === 'nominee') {
      setActiveCoreTab('nominations');
    } else if (targetRole === 'voter') {
      setActiveCoreTab('voting');
    } else if (targetRole === 'judge') {
      setActiveCoreTab('evaluation');
    } else if (targetRole === 'admin') {
      setActiveCoreTab('admin');
    } else {
      setActiveCoreTab('categories');
    }

    showToast(`Logged in successfully as ${targetRole.toUpperCase()}`, 'success');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
    showToast('Logged out of session', 'info');
  };

  // Category Actions (Award Organizer)
  const createCategory = (catData) => {
    const newCategory = {
      ...catData,
      id: `cat-${Date.now()}`,
      eventId: 'evt-2026',
      status: catData.status || 'Draft',
      assignedJudges: catData.assignedJudges || ['usr-judge-1'],
      isPublished: false,
      winnerId: null
    };

    setState((prev) => ({
      ...prev,
      categories: [newCategory, ...prev.categories]
    }));
    logAudit('CATEGORY_CREATED', 'Award Category Management', newCategory.id, `Created category "${newCategory.name}"`);
    showToast(`Category "${newCategory.name}" created!`);
  };

  const updateCategory = (id, updates) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === id ? { ...c, ...updates } : c))
    }));
    logAudit('CATEGORY_UPDATED', 'Award Category Management', id, `Updated category ${id}`);
    showToast('Category updated successfully');
  };

  const archiveCategory = (id) => {
    updateCategory(id, { status: 'Archived' });
    showToast('Category archived', 'info');
  };

  // Nomination Actions (Nominee & Organizer)
  const submitNomination = (nomData) => {
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const newNom = {
      ...nomData,
      id: `nom-${Date.now()}`,
      anonymousId: `BLIND-CAND-${randCode}`,
      nomineeId: currentUser.id,
      nomineeName: currentUser.name,
      institution: currentUser.department || 'SLIIT Faculty of Computing',
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewerNotes: null,
      stats: { publicVotes: 0 }
    };

    setState((prev) => ({
      ...prev,
      nominations: [newNom, ...prev.nominations]
    }));
    logAudit('NOMINATION_SUBMITTED', 'Nomination Management', newNom.id, `Submitted "${newNom.title}"`);
    showToast('Nomination submitted for organizer review!');
  };

  const saveNominationDraft = (nomData) => {
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const draftNom = {
      ...nomData,
      id: nomData.id || `nom-${Date.now()}`,
      anonymousId: nomData.anonymousId || `BLIND-CAND-${randCode}`,
      nomineeId: currentUser.id,
      nomineeName: currentUser.name,
      institution: currentUser.department || 'SLIIT Faculty of Computing',
      status: 'Draft',
      submittedAt: null,
      reviewedAt: null,
      reviewerNotes: null,
      stats: { publicVotes: 0 }
    };

    setState((prev) => {
      const exists = prev.nominations.some((n) => n.id === draftNom.id);
      return {
        ...prev,
        nominations: exists
          ? prev.nominations.map((n) => (n.id === draftNom.id ? draftNom : n))
          : [draftNom, ...prev.nominations]
      };
    });
    showToast('Nomination draft saved', 'info');
  };

  const withdrawNomination = (nominationId) => {
    setState((prev) => ({
      ...prev,
      nominations: prev.nominations.map((n) =>
        n.id === nominationId ? { ...n, status: 'Withdrawn' } : n
      )
    }));
    logAudit('NOMINATION_WITHDRAWN', 'Nomination Management', nominationId, `Withdrawn by nominee`);
    showToast('Nomination withdrawn', 'info');
  };

  const reviewNomination = (nominationId, newStatus, reviewerNotes) => {
    setState((prev) => ({
      ...prev,
      nominations: prev.nominations.map((n) =>
        n.id === nominationId
          ? {
              ...n,
              status: newStatus,
              reviewerNotes,
              reviewedAt: new Date().toISOString()
            }
          : n
      )
    }));
    logAudit('NOMINATION_REVIEWED', 'Nomination Management', nominationId, `Marked as ${newStatus}`);
    showToast(`Nomination marked as ${newStatus}`);
  };

  // Nominee Profile Actions
  const updateNomineeProfile = (updatedProfile) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === currentUser.id ? { ...u, ...updatedProfile } : u))
    }));
    logAudit('PROFILE_UPDATED', 'Nominee Profile Management', currentUser.id, `Profile updated`);
    showToast('Profile and credentials updated successfully');
  };

  // Judge Evaluation Actions
  const submitJudgeScore = ({ categoryId, nominationId, criteriaScores, weightedScore, feedback, isBlind }) => {
    const existingIndex = state.judgeScores.findIndex(
      (s) => s.nominationId === nominationId && s.judgeId === currentUser.id
    );

    const scoreRecord = {
      id: existingIndex >= 0 ? state.judgeScores[existingIndex].id : `eval-${Date.now()}`,
      categoryId,
      nominationId,
      judgeId: currentUser.id,
      judgeName: currentUser.name,
      isBlind,
      criteriaScores,
      weightedScore,
      feedback,
      submittedAt: new Date().toISOString()
    };

    setState((prev) => {
      const filtered = prev.judgeScores.filter(
        (s) => !(s.nominationId === nominationId && s.judgeId === currentUser.id)
      );
      return {
        ...prev,
        judgeScores: [scoreRecord, ...filtered]
      };
    });

    logAudit('SCORE_SUBMITTED', 'Evaluation & Winner Management', nominationId, `Judge score submitted: ${weightedScore}/10`);
    showToast('Evaluation score submitted successfully!');
  };

  // Public Voting Actions
  const castVote = (categoryId, nomineeId, voterNIC, voterEmail) => {
    const existingVote = state.votes.find(
      (v) => v.categoryId === categoryId && v.voterNIC.trim().toUpperCase() === voterNIC.trim().toUpperCase()
    );

    if (existingVote) {
      showToast('You have already cast a vote in this category! You may update your vote.', 'error');
      return false;
    }

    const newVote = {
      id: `vote-${Date.now()}`,
      categoryId,
      nomineeId,
      voterNIC: voterNIC.trim().toUpperCase(),
      voterEmail: voterEmail.trim().toLowerCase(),
      castAt: new Date().toISOString(),
      ipAddress: '192.248.32.' + Math.floor(10 + Math.random() * 80)
    };

    setState((prev) => ({
      ...prev,
      votes: [newVote, ...prev.votes]
    }));

    logAudit('VOTE_CAST', 'Voting Management', categoryId, `Voter (${voterNIC}) cast ballot for candidate ${nomineeId}`);
    showToast('Vote successfully recorded! Thank you for participating.');
    return true;
  };

  const updateVote = (categoryId, newNomineeId, voterNIC) => {
    setState((prev) => ({
      ...prev,
      votes: prev.votes.map((v) =>
        v.categoryId === categoryId && v.voterNIC.toUpperCase() === voterNIC.toUpperCase()
          ? { ...v, nomineeId: newNomineeId, castAt: new Date().toISOString() }
          : v
      )
    }));
    logAudit('VOTE_UPDATED', 'Voting Management', categoryId, `Voter (${voterNIC}) updated ballot`);
    showToast('Your vote was updated successfully');
  };

  const withdrawVote = (categoryId, voterNIC) => {
    setState((prev) => ({
      ...prev,
      votes: prev.votes.filter(
        (v) => !(v.categoryId === categoryId && v.voterNIC.toUpperCase() === voterNIC.toUpperCase())
      )
    }));
    logAudit('VOTE_WITHDRAWN', 'Voting Management', categoryId, `Voter (${voterNIC}) retracted ballot`);
    showToast('Your vote has been retracted', 'info');
  };

  // Results & Publication Actions (Award Organizer)
  const publishResults = (categoryId, shouldPublish, declaredWinnerId = null) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              isPublished: shouldPublish,
              winnerId: declaredWinnerId !== undefined ? declaredWinnerId : c.winnerId,
              status: shouldPublish ? 'Completed' : c.status
            }
          : c
      )
    }));

    logAudit(
      shouldPublish ? 'RESULTS_PUBLISHED' : 'RESULTS_UNPUBLISHED',
      'Result Calculation & Winner Management',
      categoryId,
      shouldPublish ? `Published winners for category ${categoryId}` : `Unpublished results for category ${categoryId}`
    );
    showToast(shouldPublish ? 'Results published to public leaderboard!' : 'Results unpublished', 'info');
  };

  const resolveTie = (categoryId, chosenWinnerId, notes) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categoryId ? { ...c, winnerId: chosenWinnerId } : c
      )
    }));
    logAudit('TIE_RESOLVED', 'Result Calculation & Winner Management', categoryId, `Broke tie in favor of ${chosenWinnerId}: ${notes}`);
    showToast('Tie broken and winner confirmed');
  };

  // Feedback Actions (bound to Spring Boot backend)
  const submitFeedback = async (fbData) => {
    try {
      const userId = ROLE_TO_USER_ID[currentRole] || 6;
      const saved = await feedbackApi.submit({
        userId,
        subject: fbData.subject || fbData.category || 'General',
        message: fbData.message || fbData.comment,
        feedbackType: fbData.feedbackType || 'SUGGESTION',
        rating: fbData.rating || 5,
        categoryId: fbData.categoryId || null
      });

      const normalized = normalizeFeedback(saved);
      setState((prev) => ({
        ...prev,
        feedback: [normalized, ...prev.feedback.filter((f) => f.id !== normalized.id)]
      }));
      logAudit('FEEDBACK_SUBMITTED', 'Feedback Management', normalized.id, `Submitted feedback: "${normalized.subject}"`);
      showToast('Thank you! Your feedback has been received.', 'success');
      return normalized;
    } catch (error) {
      console.error('Submit failed:', error);
      showToast(`Failed to submit feedback: ${error.message}`, 'error');
      throw error;
    }
  };

  const updateFeedbackStatus = async (feedbackId, status) => {
    try {
      const updated = await feedbackApi.updateStatus(feedbackId, status);
      const normalized = normalizeFeedback(updated);
      setState((prev) => ({
        ...prev,
        feedback: prev.feedback.map((f) => (f.id === feedbackId ? normalized : f))
      }));
      logAudit('FEEDBACK_STATUS_UPDATED', 'Feedback Management', feedbackId, `Status changed to ${status}`);
      showToast(`Feedback #${feedbackId} marked as ${status}`, 'success');
      return normalized;
    } catch (error) {
      console.error('Update status failed:', error);
      showToast(`Failed to update status: ${error.message}`, 'error');
      throw error;
    }
  };

  const addFeedbackReply = async (feedbackId, message) => {
    try {
      const userId = ROLE_TO_USER_ID[currentRole] || 2;
      const reply = await feedbackApi.addReply(feedbackId, { userId, message });
      await loadFeedback(); // Refresh feedback list to reflect IN_PROGRESS and new reply
      logAudit('FEEDBACK_REPLY_ADDED', 'Feedback Management', feedbackId, `Admin/Organizer reply added`);
      showToast('Reply submitted successfully!', 'success');
      return reply;
    } catch (error) {
      console.error('Add reply failed:', error);
      showToast(`Failed to add reply: ${error.message}`, 'error');
      throw error;
    }
  };

  const getFeedbackReplies = async (feedbackId) => {
    try {
      return await feedbackApi.getReplies(feedbackId);
    } catch (error) {
      console.error('Get replies failed:', error);
      return [];
    }
  };

  const deleteFeedback = async (feedbackId) => {
    try {
      await feedbackApi.delete(feedbackId);
      setState((prev) => ({
        ...prev,
        feedback: (prev.feedback || []).filter((f) => f.id !== feedbackId)
      }));
      logAudit('FEEDBACK_DELETED', 'Feedback Management', feedbackId, `Deleted feedback #${feedbackId}`);
      showToast(`Feedback #${feedbackId} deleted`, 'info');
    } catch (error) {
      console.error('Delete feedback failed:', error);
      showToast(`Failed to delete feedback: ${error.message}`, 'error');
      throw error;
    }
  };

  // Report Actions (bound to Spring Boot backend)
  const generateReport = async (reportData) => {
    try {
      const saved = await reportsApi.generate({
        reportType: reportData.reportType || 'FULL_SUMMARY',
        categoryId: reportData.categoryId || null,
        content: reportData.content || '[auto-generated]',
        generatedBy: currentUser?.name || 'Administrator',
        format: reportData.format || 'CSV'
      });

      setState((prev) => ({
        ...prev,
        reports: [saved, ...(prev.reports || []).filter((r) => r.id !== saved.id)]
      }));
      logAudit('REPORT_GENERATED', 'Reporting & Analytics', saved.id, `Generated ${saved.reportType} report`);
      showToast(`Report #${saved.id} (${saved.reportType}) generated and saved to database!`, 'success');
      return saved;
    } catch (error) {
      console.error('Generate report failed:', error);
      showToast(`Failed to generate report: ${error.message}`, 'error');
      throw error;
    }
  };

  const archiveReport = async (id) => {
    try {
      const archived = await reportsApi.archive(id);
      setState((prev) => ({
        ...prev,
        reports: (prev.reports || []).map((r) => (r.id === id ? archived : r))
      }));
      logAudit('REPORT_ARCHIVED', 'Reporting & Analytics', id, `Archived report #${id}`);
      showToast(`Report #${id} archived in database`, 'info');
      return archived;
    } catch (error) {
      console.error('Archive report failed:', error);
      showToast(`Failed to archive report: ${error.message}`, 'error');
      throw error;
    }
  };

  const deleteReport = async (reportId) => {
    try {
      await reportsApi.delete(reportId);
      setState((prev) => ({
        ...prev,
        reports: (prev.reports || []).filter((r) => r.id !== reportId)
      }));
      logAudit('REPORT_DELETED', 'Reporting & Analytics', reportId, `Deleted report #${reportId}`);
      showToast(`Report #${reportId} deleted`, 'info');
    } catch (error) {
      console.error('Delete report failed:', error);
      showToast(`Failed to delete report: ${error.message}`, 'error');
      throw error;
    }
  };

  // Analytics Snapshot Actions (bound to Spring Boot backend)
  const recordAnalyticsSnapshot = async (snapshotData) => {
    try {
      const saved = await analyticsApi.record({
        metricName: snapshotData.metricName,
        metricValue: Number(snapshotData.metricValue),
        categoryId: snapshotData.categoryId || null
      });

      setState((prev) => ({
        ...prev,
        analyticsSnapshots: [saved, ...(prev.analyticsSnapshots || []).filter((s) => s.id !== saved.id)]
      }));
      logAudit('ANALYTICS_SNAPSHOT_RECORDED', 'Reporting & Analytics', saved.id, `Recorded metric: ${saved.metricName}`);
      showToast(`Recorded analytics metric: ${saved.metricName}`, 'success');
      return saved;
    } catch (error) {
      console.error('Record analytics snapshot failed:', error);
      showToast(`Failed to record analytics snapshot: ${error.message}`, 'error');
      throw error;
    }
  };

  const deleteAnalyticsSnapshot = async (id) => {
    try {
      await analyticsApi.delete(id);
      setState((prev) => ({
        ...prev,
        analyticsSnapshots: (prev.analyticsSnapshots || []).filter((s) => s.id !== id)
      }));
      logAudit('ANALYTICS_SNAPSHOT_DELETED', 'Reporting & Analytics', id, `Deleted analytics snapshot #${id}`);
      showToast(`Snapshot #${id} deleted from database`, 'info');
    } catch (error) {
      console.error('Delete analytics snapshot failed:', error);
      showToast(`Failed to delete snapshot: ${error.message}`, 'error');
      throw error;
    }
  };

  // User Management (Admin)
  const updateUser = (userId, updates) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    }));
    logAudit('USER_UPDATED', 'User Account Management', userId, `Admin modified account ${userId}`);
    showToast('User account updated');
  };

  const addUser = (userData) => {
    const newUser = {
      ...userData,
      id: `usr-${Date.now()}`,
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };
    setState((prev) => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
    logAudit('USER_CREATED', 'User Account Management', newUser.id, `Created account for ${newUser.name}`);
    showToast(`User ${newUser.name} created!`);
  };

  // Reset to initial seed data
  const resetToDefaults = () => {
    const initial = {
      events: initialEvents,
      categories: initialCategories,
      users: initialUsers,
      nominations: initialNominations,
      judgeScores: initialJudgeScores,
      votes: initialVotes,
      auditLogs: initialAuditLogs,
      feedback: initialFeedback,
      reports: [],
      analyticsSnapshots: []
    };
    setState(initial);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Reset system to default seed data', 'info');
  };

  const value = {
    // Data
    events: state.events,
    categories: state.categories,
    users: state.users,
    nominations: state.nominations,
    judgeScores: state.judgeScores,
    votes: state.votes,
    auditLogs: state.auditLogs,
    feedback: state.feedback,
    reports: state.reports || [],
    analyticsSnapshots: state.analyticsSnapshots || [],

    // Auth & Navigation
    isAuthenticated,
    login,
    switchRole: login,
    logout,
    currentRole,
    currentUser,
    activeCoreTab,
    setActiveCoreTab,
    blindReviewEnabled,
    setBlindReviewEnabled,
    toast,
    showToast,
    theme,
    setTheme,
    toggleTheme,

    // Operations
    createCategory,
    updateCategory,
    archiveCategory,
    submitNomination,
    saveNominationDraft,
    withdrawNomination,
    reviewNomination,
    updateNomineeProfile,
    submitJudgeScore,
    castVote,
    updateVote,
    withdrawVote,
    publishResults,
    resolveTie,

    // Module 6: Reporting, Analytics & Feedback APIs
    loadFeedback,
    submitFeedback,
    updateFeedbackStatus,
    addFeedbackReply,
    getFeedbackReplies,
    deleteFeedback,
    loadReports,
    generateReport,
    archiveReport,
    deleteReport,
    loadAnalyticsSnapshots,
    recordAnalyticsSnapshot,
    deleteAnalyticsSnapshot,

    updateUser,
    addUser,
    logAudit,
    resetToDefaults
  };

  return <AwardHubContext.Provider value={value}>{children}</AwardHubContext.Provider>;
}

export function useAwardHub() {
  const context = useContext(AwardHubContext);
  if (!context) {
    throw new Error('useAwardHub must be used within an AwardHubProvider');
  }
  return context;
}