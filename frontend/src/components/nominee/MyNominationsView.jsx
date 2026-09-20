import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import StatusBadge from '../common/StatusBadge';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RotateCcw, 
  Plus, 
  Paperclip, 
  ExternalLink 
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import SubmitNominationModal from './SubmitNominationModal';

export default function MyNominationsView() {
  const { nominations, currentUser, withdrawNomination } = useAwardHub();
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  // Filter nominations where nomineeId === currentUser.id or nomineeName === currentUser.name
  const myNominations = nominations.filter(
    (n) => n.nomineeId === currentUser.id || n.nomineeName === currentUser.name
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">My Award Submissions & Status Tracking</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor the lifecycle of your award applications from initial draft through organizer review, judging, and voting
          </p>
        </div>
        <button
          onClick={() => setIsSubmitOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Submit New Nomination
        </button>
      </div>

      {myNominations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">No Nominations Submitted Yet</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            You have not applied for any award categories in this cycle. Select an open category and submit your proposal!
          </p>
          <button
            onClick={() => setIsSubmitOpen(true)}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
          >
            Create Your First Nomination
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myNominations.map((nom) => (
            <div
              key={nom.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-800/60 transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 mr-2">
                    {nom.categoryName}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                    Blind ID: {nom.anonymousId}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">{nom.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={nom.status} size="lg" />
                  {nom.status !== 'Withdrawn' && nom.status !== 'Approved' && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to withdraw this nomination?')) {
                          withdrawNomination(nom.id);
                        }
                      }}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-semibold p-1"
                      title="Withdraw application"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>

              {/* Status progression banner */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                <div className={`p-2 rounded-lg border ${nom.status ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300' : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'}`}>
                  <span className="font-bold block text-[10px] uppercase">1. Draft / Submitted</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{nom.submittedAt ? 'Completed' : 'Draft'}</span>
                </div>
                <div className={`p-2 rounded-lg border ${['Under Review', 'Approved', 'Rejected'].includes(nom.status) ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300' : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'}`}>
                  <span className="font-bold block text-[10px] uppercase">2. Organizer Review</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{nom.reviewedAt ? 'Evaluated' : 'In Progress'}</span>
                </div>
                <div className={`p-2 rounded-lg border ${nom.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'}`}>
                  <span className="font-bold block text-[10px] uppercase">3. Qualified for Voting</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{nom.status === 'Approved' ? 'Approved' : 'Pending'}</span>
                </div>
                <div className={`p-2 rounded-lg border ${nom.status === 'Approved' && nom.stats?.publicVotes > 0 ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300' : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'}`}>
                  <span className="font-bold block text-[10px] uppercase">4. Public Ballots</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{nom.stats?.publicVotes || 0} Votes</span>
                </div>
              </div>

              {/* Description & Reviewer feedback */}
              <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-950/70 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                <p className="leading-relaxed"><strong className="text-slate-800 dark:text-slate-100">Summary:</strong> {nom.summary}</p>
                {nom.reviewerNotes && (
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-100">Official Committee Feedback:</span>
                      <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5">{nom.reviewerNotes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Attached docs & links */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Evidence Attached:</span>
                  {nom.documentsAttached?.map((doc, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] border border-slate-200 dark:border-slate-700">
                      <Paperclip className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      {doc.name}
                    </span>
                  ))}
                </div>

                {nom.liveDemoUrl && (
                  <a
                    href={nom.liveDemoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 inline-flex items-center gap-1 font-semibold"
                  >
                    View Project Demo <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <SubmitNominationModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
      />
    </div>
  );
}
