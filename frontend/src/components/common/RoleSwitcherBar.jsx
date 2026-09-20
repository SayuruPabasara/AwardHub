import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  Scale, 
  Vote, 
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { useAwardHub } from '../../context/AwardHubContext';

export default function RoleSwitcherBar() {
  const { currentRole, switchRole, currentUser, resetToDefaults } = useAwardHub();

  const roles = [
    {
      id: 'organizer',
      title: 'Award Organizer',
      desc: 'Categories, Nominations & Results',
      icon: Sparkles,
      color: 'border-indigo-500 text-indigo-600 bg-indigo-50/70',
      activeColor: 'bg-indigo-600 text-white shadow-indigo-200'
    },
    {
      id: 'nominee',
      title: 'Nominee',
      desc: 'Profile, Submissions & Docs',
      icon: UserCheck,
      color: 'border-emerald-500 text-emerald-600 bg-emerald-50/70',
      activeColor: 'bg-emerald-600 text-white shadow-emerald-200'
    },
    {
      id: 'judge',
      title: 'Judge / Evaluator',
      desc: 'Blind Review & Rubric Scoring',
      icon: Scale,
      color: 'border-purple-500 text-purple-600 bg-purple-50/70',
      activeColor: 'bg-purple-600 text-white shadow-purple-200'
    },
    {
      id: 'voter',
      title: 'Public Voter',
      desc: 'NIC Verification & Ballot',
      icon: Vote,
      color: 'border-blue-500 text-blue-600 bg-blue-50/70',
      activeColor: 'bg-blue-600 text-white shadow-blue-200'
    },
    {
      id: 'admin',
      title: 'System Admin',
      desc: 'Users, Security & Audit Logs',
      icon: ShieldCheck,
      color: 'border-rose-500 text-rose-600 bg-rose-50/70',
      activeColor: 'bg-rose-600 text-white shadow-rose-200'
    }
  ];

  return (
    <div className="bg-slate-100 text-slate-900 border-b border-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800 px-4 py-2.5 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Active Stakeholder Info */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
            Role Simulation Mode:
          </span>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs shadow-xs">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-5 h-5 rounded-full object-cover ring-1 ring-amber-400/50" 
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser.name}</span>
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">({currentUser.role})</span>
          </div>
        </div>

        {/* 5-Role Switcher Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => switchRole(r.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shadow-xs ${
                  isActive
                    ? `${r.activeColor} ring-2 ring-indigo-500/20 dark:ring-white/20`
                    : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:border-slate-800'
                }`}
                title={r.desc}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{r.title}</span>
              </button>
            );
          })}

          <button
            onClick={resetToDefaults}
            className="p-1.5 rounded-lg bg-white text-slate-500 hover:text-amber-600 hover:bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-slate-800 dark:border-slate-800 transition-colors ml-1 shadow-xs"
            title="Reset system demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
