import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import { calculateCategoryResults } from '../../utils/scoringCalculator';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { 
  Trophy, 
  Scale, 
  Vote, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  Share2,
  Sliders,
  Send
} from 'lucide-react';

export default function ResultsPublisher() {
  const { 
    categories, 
    nominations, 
    judgeScores, 
    votes, 
    publishResults, 
    resolveTie 
  } = useAwardHub();

  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');
  const [tieModalData, setTieModalData] = useState(null);
  const [tieSelectedWinner, setTieSelectedWinner] = useState('');
  const [tieNotes, setTieNotes] = useState('');

  const currentCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];

  // Calculate live results using scoring engine
  const rankings = calculateCategoryResults(currentCategory, nominations, judgeScores, votes);

  const hasTie = rankings.some((r) => r.isTie);
  const isPublished = currentCategory?.isPublished || false;

  const handleTogglePublish = () => {
    const defaultWinnerId = rankings[0]?.nominationId || null;
    publishResults(currentCategory.id, !isPublished, defaultWinnerId);
  };

  const handleOpenTieResolution = () => {
    const tiedCandidates = rankings.filter((r) => r.isTie);
    setTieModalData(tiedCandidates);
    setTieSelectedWinner(tiedCandidates[0]?.nominationId || '');
    setTieNotes('Decided based on higher methodological rigor and empirical benchmarks.');
  };

  const handleConfirmTie = (e) => {
    e.preventDefault();
    if (!tieSelectedWinner) return;
    resolveTie(currentCategory.id, tieSelectedWinner, tieNotes);
    setTieModalData(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Score Aggregation, Tie Resolution & Publication</h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Module 5
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated weighted calculations combining judge scoring rubrics and authenticated public voting ballots.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePublish}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isPublished
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white ring-2 ring-indigo-500/20'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              {isPublished ? 'Published to Public (Unpublish)' : 'Publish Final Winners to Public'}
            </button>
          </div>
        </div>

        {/* Category Picker & Formula Indicator */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Category:</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code}) - {c.status}
                </option>
              ))}
            </select>
          </div>

          {currentCategory && (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Configured Formula:</span>
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-900">
                {currentCategory.evaluationMode === 'hybrid'
                  ? `${currentCategory.weights?.judge}% Judge + ${currentCategory.weights?.public}% Public`
                  : currentCategory.evaluationMode === 'judge_only'
                  ? '100% Judge Score'
                  : '100% Public Votes'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tie Alert Banner if applicable */}
      {hasTie && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-bold block">Score Tie Detected in Current Category!</span>
              <span>Two or more candidates share identical weighted aggregate scores. Organizer resolution is required.</span>
            </div>
          </div>
          <button
            onClick={handleOpenTieResolution}
            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 whitespace-nowrap"
          >
            Resolve Tie with Tie-Breaker
          </button>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors duration-200">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Live Weighted Standings & Leaderboard
          </h4>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {rankings.length} qualified candidates evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 uppercase font-semibold border-b border-slate-200 dark:border-slate-800 text-[11px]">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Candidate / Dossier</th>
                <th className="px-4 py-3 text-center">Judge Avg (/10)</th>
                <th className="px-4 py-3 text-center">Public Votes</th>
                <th className="px-4 py-3 text-center">Vote Share %</th>
                <th className="px-4 py-3 text-right">Weighted Final Score</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rankings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                    No approved candidates found in this category.
                  </td>
                </tr>
              ) : (
                rankings.map((item) => {
                  const isTop = item.rank === 1;
                  return (
                    <tr
                      key={item.nominationId}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors ${
                        isTop ? 'bg-amber-50/30 dark:bg-amber-950/20 font-semibold' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs ${
                            item.rank === 1
                              ? 'bg-amber-400 text-slate-950 shadow-xs'
                              : item.rank === 2
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                              : item.rank === 3
                              ? 'bg-amber-700/20 text-amber-900 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {item.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{item.nomineeName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">{item.title}</div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{item.anonymousId}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                          {item.judgeAvgScore} / 10
                        </span>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{item.evaluationCount} judges</div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {item.publicVotes}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                        {item.publicVoteSharePct}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                          {item.finalScore}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500"> / 100</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isTop && isPublished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[11px] font-bold border border-amber-300 dark:border-amber-800">
                            <Trophy className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            Official Winner
                          </span>
                        ) : isTop ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800">
                            Leading Candidate
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-[11px]">Finalist</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tie Breaker Modal */}
      {tieModalData && (
        <Modal
          isOpen={Boolean(tieModalData)}
          onClose={() => setTieModalData(null)}
          title="Resolve Score Tie (Tie-Breaker Committee Protocol)"
          subtitle={`Category: ${currentCategory.name}`}
        >
          <form onSubmit={handleConfirmTie} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Select the final winner among the tied finalists according to the award committee's secondary evaluation criteria:
            </p>

            <div className="space-y-2">
              {tieModalData.map((cand) => (
                <label
                  key={cand.nominationId}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    tieSelectedWinner === cand.nominationId
                      ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30 dark:bg-amber-950/40 dark:border-amber-700'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="tieWinner"
                    value={cand.nominationId}
                    checked={tieSelectedWinner === cand.nominationId}
                    onChange={(e) => setTieSelectedWinner(e.target.value)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{cand.nomineeName}</span>
                    <span className="text-slate-500 dark:text-slate-400">{cand.title} (Score: {cand.finalScore})</span>
                  </div>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Tie Resolution Rationale (Audit Record) *
              </label>
              <textarea
                required
                rows={3}
                value={tieNotes}
                onChange={(e) => setTieNotes(e.target.value)}
                placeholder="Explain the committee's decision (e.g. higher originality score, peer review feedback)..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-3 py-2 text-xs focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setTieModalData(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Confirm Winner & Save Audit Trail
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
