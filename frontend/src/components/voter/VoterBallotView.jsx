import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import VoterVerificationModal from './VoterVerificationModal';
import StatusBadge from '../common/StatusBadge';
import { 
  Vote, 
  CheckCircle2, 
  Calendar, 
  ExternalLink, 
  FileText, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export default function VoterBallotView() {
  const { 
    categories, 
    nominations, 
    votes, 
    castVote, 
    currentUser, 
    setActiveTab 
  } = useAwardHub();

  const votingCategories = categories.filter(
    (c) => c.status === 'Voting Active' || c.evaluationMode !== 'judge_only'
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState(votingCategories[0]?.id || '');
  const [candidateToVote, setCandidateToVote] = useState(null);

  const currentCategory = categories.find((c) => c.id === selectedCategoryId) || votingCategories[0];

  const approvedCandidates = nominations.filter(
    (n) => n.categoryId === currentCategory?.id && n.status === 'Approved'
  );

  // Check if current user has already voted in this category
  const myVoteInCategory = votes.find(
    (v) => v.categoryId === currentCategory?.id && v.voterNIC === currentUser?.nic
  );

  const handleVoteClick = (candidate) => {
    setCandidateToVote(candidate);
  };

  const handleConfirmVote = (nic, email) => {
    return castVote(currentCategory.id, candidateToVote.id, nic, email);
  };

  return (
    <div className="space-y-6">
      {/* Category Banner & Voting Window Info */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Official Public Voting Ballot</h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Verified Voter
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review qualified finalists and cast your authenticated vote. Each verified voter receives 1 vote per award category.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('my-votes')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap"
          >
            View My Cast Ballots →
          </button>
        </div>

        {/* Category Selector Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Category:</span>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              {votingCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {currentCategory && (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                Voting Closes: <strong className="text-slate-800 dark:text-slate-200">{formatDate(currentCategory.schedules?.votingEnd)}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border border-blue-100 dark:border-blue-900/60">
                Public Weight: {currentCategory.weights?.public}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Existing Vote Alert for this category */}
      {myVoteInCategory && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <span className="font-bold block">You have already voted in this category!</span>
              <span>Your vote is currently locked for candidate <strong className="text-emerald-950 dark:text-emerald-100">{nominations.find((n) => n.id === myVoteInCategory.nomineeId)?.title}</strong>. You may update or withdraw your ballot before the deadline.</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('my-votes')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 whitespace-nowrap transition-colors"
          >
            Manage Vote
          </button>
        </div>
      )}

      {/* Candidate Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {approvedCandidates.length === 0 ? (
          <div className="col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            No approved candidates found for public voting in this category yet.
          </div>
        ) : (
          approvedCandidates.map((candidate) => {
            const isMyVote = myVoteInCategory?.nomineeId === candidate.id;
            const candidateVotesCount = votes.filter((v) => v.categoryId === currentCategory.id && v.nomineeId === candidate.id).length;

            return (
              <div
                key={candidate.id}
                className={`rounded-xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isMyVote
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10 dark:bg-blue-950/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {candidate.anonymousId}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">{candidate.title}</h4>
                      <p className="text-xs text-indigo-700 dark:text-indigo-400 font-medium">{candidate.nomineeName} • {candidate.institution}</p>
                    </div>

                    {isMyVote && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Your Vote
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                    {candidate.summary}
                  </p>

                  <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/70 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border border-slate-100 dark:border-slate-800">
                    <strong className="text-slate-700 dark:text-slate-200 block mb-0.5">Impact Pitch:</strong>
                    {candidate.detailedPitch}
                  </div>

                  {/* Supporting link & documents */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    {candidate.liveDemoUrl && (
                      <a
                        href={candidate.liveDemoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
                      >
                        Project Demo <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {candidate.documentsAttached?.length || 0} verified documentation files
                    </span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <Vote className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Public Support: <strong className="text-slate-800 dark:text-slate-200">{candidateVotesCount} votes</strong></span>
                  </div>

                  <button
                    disabled={isMyVote}
                    onClick={() => handleVoteClick(candidate)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${
                      isMyVote
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Vote className="w-3.5 h-3.5" />
                    {isMyVote ? 'Vote Cast' : 'Vote for Candidate'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <VoterVerificationModal
        isOpen={Boolean(candidateToVote)}
        onClose={() => setCandidateToVote(null)}
        candidateToVoteFor={candidateToVote}
        category={currentCategory}
        onConfirmVote={handleConfirmVote}
        defaultNIC={currentUser?.nic}
        defaultEmail={currentUser?.email}
      />
    </div>
  );
}
