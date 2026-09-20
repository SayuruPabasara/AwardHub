import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import { calculateCategoryResults } from '../../utils/scoringCalculator';
import { Trophy, Medal, Award, Sparkles, ExternalLink } from 'lucide-react';

export default function PublicWinnersView() {
  const { categories, nominations, judgeScores, votes } = useAwardHub();

  const publishedCategories = categories.filter((c) => c.isPublished || c.status === 'Completed');
  const [selectedCatId, setSelectedCatId] = useState(publishedCategories[0]?.id || categories[0]?.id);

  const activeCategory = categories.find((c) => c.id === selectedCatId) || publishedCategories[0];
  const results = activeCategory ? calculateCategoryResults(activeCategory, nominations, judgeScores, votes) : [];
  const winner = results[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-amber-100 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            Official Award Announcements
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hall of Laureates & Official Winners
          </h2>
          <p className="text-amber-100 text-xs sm:text-sm mt-2 leading-relaxed">
            Honoring exceptional student innovations, faculty breakthroughs, and impactful leadership recognized by the SLIIT 2026 Awards Steering Committee.
          </p>
        </div>
      </div>

      {publishedCategories.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center text-xs text-slate-500 dark:text-slate-400">
          <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">No Categories Published Yet</h4>
          <p className="mt-1">
            The Award Organizer has not officially published winners for the active cycles yet. Check back once voting and judging conclude!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {publishedCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCatId(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCatId === c.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Winner Showcase Card */}
          {winner && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-400 dark:border-amber-500 p-6 shadow-md relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg font-black text-2xl flex-shrink-0">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                      Grand Award Laureate • 1st Place
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{winner.title}</h3>
                    <p className="text-xs text-indigo-700 dark:text-indigo-400 font-bold">{winner.nomineeName} • {winner.institution}</p>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/40 px-5 py-3 rounded-xl border border-amber-200 dark:border-amber-800 text-right">
                  <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 block">Final Aggregate Score</span>
                  <span className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">{winner.finalScore}</span>
                  <span className="text-xs text-amber-600 dark:text-amber-400"> / 100</span>
                </div>
              </div>
            </div>
          )}

          {/* Ranked Leaderboard */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Official Final Standings</h4>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Formula: {activeCategory?.evaluationMode === 'hybrid' ? `${activeCategory.weights?.judge}% Judge + ${activeCategory.weights?.public}% Public` : 'Direct Scoring'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Place</th>
                    <th className="px-4 py-3">Candidate / Initiative</th>
                    <th className="px-4 py-3 text-center">Judge Avg</th>
                    <th className="px-4 py-3 text-center">Public Support</th>
                    <th className="px-4 py-3 text-right">Aggregate Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {results.map((r) => (
                    <tr key={r.nominationId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <span
                          className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs ${
                            r.rank === 1
                              ? 'bg-amber-400 text-slate-950'
                              : r.rank === 2
                              ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                              : r.rank === 3
                              ? 'bg-amber-700/20 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {r.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {r.title}
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400">{r.nomineeName} ({r.institution})</span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-purple-700 dark:text-purple-400">
                        {r.judgeAvgScore} / 10
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        {r.publicVotes} votes ({r.publicVoteSharePct}%)
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-black text-slate-900 dark:text-white text-sm">
                        {r.finalScore} / 100
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
