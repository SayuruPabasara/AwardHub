import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { 
  CheckSquare, 
  CheckCircle, 
  XCircle, 
  FileText, 
  ExternalLink, 
  Search, 
  Filter,
  Eye,
  AlertCircle
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export default function NominationReviewQueue() {
  const { nominations, categories, reviewNomination } = useAwardHub();

  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected nomination for review modal
  const [selectedNomination, setSelectedNomination] = useState(null);
  const [reviewAction, setReviewAction] = useState('Approved'); // 'Approved' | 'Rejected'
  const [reviewerNotes, setReviewerNotes] = useState('');

  const filteredNominations = nominations.filter((n) => {
    const matchesCat = filterCategory === 'all' || n.categoryId === filterCategory;
    const matchesStatus = filterStatus === 'all' || n.status === filterStatus;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.nomineeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.anonymousId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  const handleOpenReview = (nom, action) => {
    setSelectedNomination(nom);
    setReviewAction(action);
    setReviewerNotes(nom.reviewerNotes || (action === 'Approved' ? 'Candidate meets all category eligibility guidelines and provided requisite documents.' : 'Candidate does not meet requisite criteria for this cycle.'));
  };

  const handleConfirmReview = (e) => {
    e.preventDefault();
    if (!selectedNomination) return;

    reviewNomination(selectedNomination.id, reviewAction, reviewerNotes);
    setSelectedNomination(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nomination Review & Eligibility Verification</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Module 2: Review incoming applicant submissions, verify requirements, and qualify candidates for evaluation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Total Submissions: {nominations.length}
            </span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate, project, or ID..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Award Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Review Statuses</option>
              <option value="Submitted">Submitted (Needs Review)</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved / Qualified</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table of Nominations */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/80 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Candidate / Nominee</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Project / Innovation Title</th>
                <th className="px-4 py-3">Submitted At</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredNominations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                    No nominations match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredNominations.map((nom) => (
                  <tr key={nom.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      <div>{nom.nomineeName}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">{nom.anonymousId} • {nom.institution}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900">
                        {nom.categoryName}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" title={nom.title}>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{nom.title}</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{nom.summary}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {formatDateTime(nom.submittedAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={nom.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenReview(nom, nom.status === 'Approved' ? 'Rejected' : 'Approved')}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                        title="View Submission Dossier"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenReview(nom, 'Approved')}
                        className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900/50 text-xs font-semibold transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleOpenReview(nom, 'Rejected')}
                        className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 dark:hover:bg-rose-900/50 text-xs font-semibold transition-colors"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Verification Modal */}
      {selectedNomination && (
        <Modal
          isOpen={Boolean(selectedNomination)}
          onClose={() => setSelectedNomination(null)}
          title={`Review Nomination: ${selectedNomination.title}`}
          subtitle={`Applicant: ${selectedNomination.nomineeName} (${selectedNomination.anonymousId})`}
          maxWidth="max-w-3xl"
        >
          <form onSubmit={handleConfirmReview} className="space-y-4">
            {/* Dossier Information */}
            <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Award Category</span>
                <p className="font-bold text-indigo-700 dark:text-indigo-400 text-sm">{selectedNomination.categoryName}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Executive Summary</span>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">{selectedNomination.summary}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Detailed Impact Pitch</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{selectedNomination.detailedPitch}</p>
              </div>

              {selectedNomination.liveDemoUrl && (
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Project Demo / Source</span>
                  <p className="mt-0.5">
                    <a
                      href={selectedNomination.liveDemoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-mono"
                    >
                      {selectedNomination.liveDemoUrl}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
              )}

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Uploaded Documents</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedNomination.documentsAttached?.map((doc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px]"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      {doc.name} ({doc.size})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Review Decision */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Organizer Decision
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewAction('Approved')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                    reviewAction === 'Approved'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve for Evaluation & Voting
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction('Rejected')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                    reviewAction === 'Rejected'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  Reject Submission
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Reviewer Evaluation Notes & Feedback *
              </label>
              <textarea
                required
                rows={3}
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Provide rationale for approval or specific rejection feedback for the applicant..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 text-xs focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedNomination(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2 rounded-lg text-white text-xs font-semibold shadow-sm transition-colors ${
                  reviewAction === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {reviewAction} Decision
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
