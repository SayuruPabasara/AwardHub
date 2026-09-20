import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  Calendar, 
  RotateCcw,
  Award,
  FileText,
  User,
  Vote,
  Scale,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { useAwardHub } from '../../context/AwardHubContext';
import ThemeToggle from './ThemeToggle';

export default function Header({ onMobileMenuClick }) {
  const { 
    activeCoreTab, 
    currentRole, 
    currentUser, 
    events, 
    auditLogs,
    resetToDefaults 
  } = useAwardHub();

  const [showNotifications, setShowNotifications] = useState(false);

  const currentEvent = events[0];

  const getModuleTitle = () => {
    switch (activeCoreTab) {
      case 'categories':
        return {
          title: 'Award Category Management',
          desc: 'Configure category definitions, eligibility rules, schedules, and hybrid weights',
          icon: Award,
          lead: 'Ahamed M.J.S. (IT25101477)'
        };
      case 'nominations':
        return {
          title: 'Nomination Management',
          desc: 'Submit project proposals, review applicant dossiers, and track qualification status',
          icon: FileText,
          lead: 'Tharuneth M.A.D. (IT25103253)'
        };
      case 'profile':
        return {
          title: 'Nominee Profile Management',
          desc: 'Maintain candidate credentials, achievements, experience, and supporting document vault',
          icon: User,
          lead: 'Eragoda W.M.S.P. (IT25102287)'
        };
      case 'voting':
        return {
          title: 'Voting Management',
          desc: 'Conduct authenticated public balloting with Sri Lankan NIC verification and audit trails',
          icon: Vote,
          lead: 'Fernando W.M.M.P.D. (IT25102733)'
        };
      case 'evaluation':
        return {
          title: 'Evaluation, Result Calculation & Winner Management',
          desc: 'Independent blind review, multi-criteria rubric scoring, hybrid calculation, and winner publication',
          icon: Scale,
          lead: 'Rukshan P.K.R (IT25100737)'
        };
      case 'analytics':
        return {
          title: 'Reporting, Analytics & Feedback Management',
          desc: 'Participation analytics, CSV reports generation, and stakeholder feedback collection',
          icon: BarChart3,
          lead: 'Hayas M.L.M (IT25100153)'
        };
      case 'admin':
        return {
          title: 'System Administration & Security Governance',
          desc: 'User account management, RBAC enforcement, maintenance controls, and audit trails',
          icon: ShieldCheck,
          lead: 'System Administration'
        };
      default:
        return {
          title: 'AwardHub System',
          desc: 'Web-based Voting System for Award Nominations',
          icon: Award,
          lead: 'SE2030 Software Engineering'
        };
    }
  };

  const info = getModuleTitle();
  const Icon = info.icon;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors duration-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Mobile Drawer Trigger + Active Core Function Header */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onMobileMenuClick}
                className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                aria-label="Open left menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center text-indigo-700 dark:text-indigo-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                      {info.title}
                    </h2>
                    <span className="hidden md:inline-block text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {info.lead}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate max-w-lg">
                    {info.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Actions, Theme Toggle, Notifications, Role Badge */}
            <div className="flex items-center gap-2.5">
              {/* Event stage pill */}
              <div className="hidden xl:flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400">Event Phase:</span>
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">{currentEvent?.currentStage} Stage</span>
              </div>

              {/* Theme Toggle (Sun / Moon) */}
              <ThemeToggle size="md" />

              {/* Reset Demo Data Button */}
              <button
                onClick={resetToDefaults}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                title="Reset demo seed data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Notifications / Activity Logs Drawer */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors relative"
                  aria-label="View activity alerts"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Recent System Activity</h4>
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">{auditLogs.length} events logged</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {auditLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs transition-colors">
                          <div className="flex items-center justify-between text-slate-400 text-[10px]">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{log.role}</span>
                            <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{log.action.replace('_', ' ')}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{log.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Current User Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{currentUser?.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight capitalize font-semibold">{currentUser?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
  );
}
