import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import RubricScoringModal from './RubricScoringModal';
import { 
  Scale, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Clock, 
  Award, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export default function JudgeDashboard() {
  const { 
    currentUser, 
    categories, 
    nominations, 
    judgeScores, 
    blindReviewEnabled, 
    setBlindReviewEnabled 
  } = useAwardHub();

  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [activeScoringNomination, setActiveScoringNomination] = useState(null);

  // Categories assigned to current judge
  const assignedCategories = categories.filter(
    (c) => c.assignedJudges?.includes(currentUser.id) || selectedCategoryId === 'all'
  );

  // Qualified (Approved) nominations available for judging
  const qualifiedNominations = nominations.filter((n) => {
    const isApproved = n.status === 'Approved';
    const matchesCat = selectedCategoryId === 'all' || n.categoryId === selectedCategoryId;
    return isApproved && matchesCat;
  });

  // Calculate judge's progress
  const myEvaluatedNominationIds = judgeScores
    .filter((s) => s.judgeId === currentUser.id)
    .map((s) => s.nominationId);

  const completedCount = qualifiedNominations.filter((n) =>
    myEvaluatedNominationIds.includes(n.id)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Banner with Blind Review Toggle */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Judge Evaluation & Blind Review Portal</h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Official Evaluator
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Score candidate dossiers independently against predefined weighted rubrics.
            </p>
          </div>

          {/* Blind Review Mode Toggle (from proposal requirements) */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/70 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              {blindReviewEnabled ? (
                <EyeOff className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              ) : (
                <Eye className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              )}
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight">Blind Review Mode</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {blindReviewEnabled ? 'Masking candidate names & photos' : 'Showing candidate names'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setBlindReviewEnabled(!blindReviewEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                blindReviewEnabled ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  blindReviewEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Category Filter and Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Filter Assigned Category:</span>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="all">All Assigned Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Evaluation Progress: {completedCount} of {qualifiedNominations.length} Scored
            </span>
            <div className="w-32 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
              <div
                className="h-full bg-purple-600 transition-all duration-300"
                style={{
                  width: `${
                    qualifiedNominations.length > 0
                      ? (completedCount / qualifiedNominations.length) * 100
                      : 0
                  }%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Evaluation Queue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {qualifiedNominations.length === 0 ? (
          <div className="col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            No qualified nominations available for judging in this category yet.
          </div>
        ) : (
          qualifiedNominations.map((nom) => {
            const cat = categories.find((c) => c.id === nom.categoryId);
            const myScore = judgeScores.find(
              (s) => s.nominationId === nom.id && s.judgeId === currentUser.id
            );

            return (
              <div
                key={nom.id}
                className={`rounded-xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                  myScore 
                    ? 'border-purple-200 dark:border-purple-800 bg-purple-50/10 dark:bg-purple-950/20' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                        {blindReviewEnabled ? nom.anonymousId : nom.nomineeName}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-2">
                        {cat?.name}
                      </span>
                    </div>

                    {myScore ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        Scored: {myScore.weightedScore}/10
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        Pending
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2.5">{nom.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{nom.summary}</p>

                  {/* Criteria Preview */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5 text-[10px]">
                    {cat?.rubric?.map((r) => (
                      <span key={r.id} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {r.name} ({r.weight}%)
                      </span>
                    ))}
                  </div>

                  {myScore?.feedback && (
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 italic">
                      "{myScore.feedback}"
                    </div>
                  )}
                </div>

                {/* Footer action */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {nom.documentsAttached?.length || 0} Evidence Docs Attached
                  </span>
                  <button
                    onClick={() => setActiveScoringNomination({ nomination: nom, category: cat })}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                      myScore
                        ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    {myScore ? 'Revise Evaluation' : 'Score Dossier'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rubric Scoring Modal */}
      {activeScoringNomination && (
        <RubricScoringModal
          isOpen={Boolean(activeScoringNomination)}
          onClose={() => setActiveScoringNomination(null)}
          nomination={activeScoringNomination.nomination}
          category={activeScoringNomination.category}
          isBlind={blindReviewEnabled}
        />
      )}
    </div>
  );
}
