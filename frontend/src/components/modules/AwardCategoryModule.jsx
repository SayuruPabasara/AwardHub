import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import CategoryListView from '../organizer/CategoryListView';
import OrganizerDashboard from '../organizer/OrganizerDashboard';
import StatusBadge from '../common/StatusBadge';
import { Award, Calendar, Sliders, ShieldCheck, Info } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export default function AwardCategoryModule() {
  const { currentRole, categories, nominations, votes } = useAwardHub();
  const [subTab, setSubTab] = useState('categories'); // 'categories' | 'lifecycle'

  // If Organizer: show full category management with sub-tab for 5-stage lifecycle
  if (currentRole === 'organizer') {
    return (
      <div className="space-y-6">
        {/* Role Capability Bar */}
        <div className="flex items-center justify-between bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 px-4 py-3 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-indigo-950 dark:text-indigo-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span>Role Permissions: <strong>Award Organizer</strong> — Full CRUD authority on categories, schedules & weights.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSubTab('categories')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subTab === 'categories'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Category Config & Tables
            </button>
            <button
              onClick={() => setSubTab('lifecycle')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subTab === 'lifecycle'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              5-Stage Lifecycle Visualizer
            </button>
          </div>
        </div>

        {subTab === 'categories' ? <CategoryListView /> : <OrganizerDashboard />}
      </div>
    );
  }

  // Non-Organizer Stakeholders (Nominees, Judges, Voters, Admins): View Category Directory & Guidelines
  return (
    <div className="space-y-6">
      {/* Role Context Alert */}
      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <span>
            Viewing official award categories as <strong>{currentRole.toUpperCase()}</strong>. Configuration controls are restricted to the Award Organizer.
          </span>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
          {categories.length} Published Categories
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const catNoms = nominations.filter((n) => n.categoryId === cat.id && n.status === 'Approved');
          const catVotes = votes.filter((v) => v.categoryId === cat.id);

          return (
            <div key={cat.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {cat.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">{cat.name}</h3>
                  </div>
                  <StatusBadge status={cat.status} />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {cat.description}
                </p>

                <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <strong className="text-slate-900 dark:text-slate-100 block text-[11px] uppercase tracking-wider">Eligibility Requirements:</strong>
                  <p>{cat.eligibility}</p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-100 dark:border-indigo-900">
                    Mode: {cat.evaluationMode.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium border border-amber-100 dark:border-amber-900 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Voting Closes: {formatDate(cat.schedules?.votingEnd)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{catNoms.length} Qualified Finalists</span>
                <span>{catVotes.length} Public Votes</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
