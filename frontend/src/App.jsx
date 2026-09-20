import React, { useState } from 'react';
import { AwardHubProvider, useAwardHub } from './context/AwardHubContext';
import LoginView from './components/auth/LoginView';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import Toast from './components/common/Toast';

// Core Function Modules (Inculcating role-based capabilities)
import AwardCategoryModule from './components/modules/AwardCategoryModule';
import NominationManagementModule from './components/modules/NominationManagementModule';
import NomineeProfileModule from './components/modules/NomineeProfileModule';
import VotingManagementModule from './components/modules/VotingManagementModule';
import EvaluationWinnersModule from './components/modules/EvaluationWinnersModule';
import ReportingFeedbackModule from './components/modules/ReportingFeedbackModule';
import SystemAdminModule from './components/modules/SystemAdminModule';

import ErrorBoundary from './components/common/ErrorBoundary';

function MainAppLayout() {
  const { isAuthenticated, activeCoreTab } = useAwardHub();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If user is not authenticated, show role-based login screen
  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderCoreModule = () => {
    switch (activeCoreTab) {
      case 'categories':
        return <AwardCategoryModule />;
      case 'nominations':
        return <NominationManagementModule />;
      case 'profile':
        return <NomineeProfileModule />;
      case 'voting':
        return <VotingManagementModule />;
      case 'evaluation':
        return <EvaluationWinnersModule />;
      case 'analytics':
        return <ReportingFeedbackModule />;
      case 'admin':
        return <SystemAdminModule />;
      default:
        return <AwardCategoryModule />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Left Panel Sidebar (6 Core Functions) */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Workspace Area (Offset by Sidebar width on lg screens) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header onMobileMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <ErrorBoundary>
            {renderCoreModule()}
          </ErrorBoundary>
        </main>

        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-12 py-5 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white">Award<span className="text-amber-500">Hub</span></span>
              <span>• Centralized Web-based Voting System for Award Nominations</span>
            </div>

            <div className="text-slate-400 dark:text-slate-500 text-[11px]">
              SLIIT SE2030 Software Engineering • Group 2026-Y2-S1-MLB-B10G2-06
            </div>
          </div>
        </footer>

        <Toast />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AwardHubProvider>
      <MainAppLayout />
    </AwardHubProvider>
  );
}
