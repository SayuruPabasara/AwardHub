import React from 'react';
import { 
  Trophy, 
  Award, 
  FileText, 
  User, 
  Vote, 
  Scale, 
  BarChart3, 
  ShieldCheck, 
  LogOut
} from 'lucide-react';
import { useAwardHub } from '../../context/AwardHubContext';
import { getRoleBadge } from '../../utils/formatters';
import ThemeToggle from './ThemeToggle';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { 
    activeCoreTab, 
    setActiveCoreTab, 
    currentRole, 
    currentUser, 
    logout, 
    nominations,
    categories
  } = useAwardHub();

  const roleBadge = getRoleBadge(currentRole);
  const pendingNominationsCount = nominations.filter((n) => n.status === 'Submitted' || n.status === 'Under Review').length;
  const activeVotingCount = categories.filter((c) => c.status === 'Voting Active').length;

  const coreTabs = [
    {
      id: 'categories',
      number: '1',
      title: 'Award Category Management',
      short: 'Category Management',
      icon: Award,
      badge: `${categories.length} Categories`,
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
    },
    {
      id: 'nominations',
      number: '2',
      title: 'Nomination Management',
      short: 'Nomination Management',
      icon: FileText,
      badge: currentRole === 'organizer' && pendingNominationsCount > 0 ? `${pendingNominationsCount} Pending` : `${nominations.length} Entries`,
      badgeColor: currentRole === 'organizer' && pendingNominationsCount > 0 ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
    },
    {
      id: 'profile',
      number: '3',
      title: 'Nominee Profile Management',
      short: 'Nominee Profiles',
      icon: User,
      badge: 'Vault & Dossier',
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
    },
    {
      id: 'voting',
      number: '4',
      title: 'Voting Management',
      short: 'Voting Management',
      icon: Vote,
      badge: 'Live NIC Ballot',
      badgeColor: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
    },
    {
      id: 'evaluation',
      number: '5',
      title: 'Evaluation & Winner Management',
      short: 'Evaluation & Winners',
      icon: Scale,
      badge: 'Blind Rubrics',
      badgeColor: 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
    },
    {
      id: 'analytics',
      number: '6',
      title: 'Reporting, Analytics & Feedback',
      short: 'Reports & Feedback',
      icon: BarChart3,
      badge: 'Metrics & CSV',
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
    }
  ];

  // If user is Admin, add System Administration tab
  if (currentRole === 'admin') {
    coreTabs.push({
      id: 'admin',
      number: '⚙',
      title: 'System Administration & Security',
      short: 'System Admin',
      icon: ShieldCheck,
      badge: 'RBAC & Audit',
      badgeColor: 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
    });
  }

  const handleTabClick = (tabId) => {
    setActiveCoreTab(tabId);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 transition-colors duration-200 lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div>
        {/* Brand & Academic Info */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 flex-shrink-0">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Award<span className="text-amber-500 dark:text-amber-400">Hub</span></span>
                <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  SLIIT
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wide">
                SE2030 Software Engineering
              </p>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Cycle:</span>
            <span className="text-[11px] font-bold text-indigo-700 dark:text-amber-300">Annual Tech Awards 2026</span>
          </div>
        </div>

        {/* Navigation Core Functions Header */}
        <div className="px-4 pt-4 pb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Core System Functions (6 Modules)
          </span>
        </div>

        {/* Main Tabs List */}
        <nav className="px-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-none">
          {coreTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCoreTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5 text-left truncate">
                  <span
                    className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${
                      isActive 
                        ? 'bg-indigo-800 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:text-white'
                    }`}
                  >
                    {tab.number}
                  </span>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'}`} />
                  <span className="truncate">{tab.short}</span>
                </div>

                {tab.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ml-1.5 flex-shrink-0 ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Session Footer & Quick Switch */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/50 flex-shrink-0"
            />
            <div className="truncate text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser?.name}</p>
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.2 rounded-full border ${roleBadge.style}`}>
                {roleBadge.label}
              </span>
            </div>
          </div>
          <ThemeToggle size="sm" variant="segmented" />
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 text-xs font-semibold border border-slate-200 dark:border-slate-700/60 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout / Switch Account
        </button>
      </div>
    </aside>
  );
}
