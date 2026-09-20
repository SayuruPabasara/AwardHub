import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import MyNominationsView from '../nominee/MyNominationsView';
import NominationReviewQueue from '../organizer/NominationReviewQueue';
import { FileText, CheckSquare, Plus, Info } from 'lucide-react';
import SubmitNominationModal from '../nominee/SubmitNominationModal';

export default function NominationManagementModule() {
  const { currentRole, nominations } = useAwardHub();
  const [activeView, setActiveView] = useState(
    currentRole === 'nominee' ? 'my_nominations' : 'review_queue'
  );
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const pendingCount = nominations.filter((n) => n.status === 'Submitted' || n.status === 'Under Review').length;

  return (
    <div className="space-y-6">
      {/* Role Function Sub-Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 px-4 py-3 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-indigo-950 dark:text-indigo-200 font-medium">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          <span>
            Current View: <strong>{currentRole.toUpperCase()}</strong> {currentRole === 'nominee' ? '— Managing personal dossiers & submissions' : '— Managing committee qualification & reviews'}
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('my_nominations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'my_nominations'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Applicant Dossier Portal
          </button>
          <button
            onClick={() => setActiveView('review_queue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'review_queue'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Organizer Review Queue ({pendingCount})
          </button>
        </div>
      </div>

      {activeView === 'my_nominations' ? (
        <MyNominationsView />
      ) : (
        <NominationReviewQueue />
      )}

      <SubmitNominationModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
      />
    </div>
  );
}
