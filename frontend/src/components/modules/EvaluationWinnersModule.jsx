import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import JudgeDashboard from '../judge/JudgeDashboard';
import ResultsPublisher from '../organizer/ResultsPublisher';
import JudgeAssignmentView from '../organizer/JudgeAssignmentView';
import PublicWinnersView from '../voter/PublicWinnersView';
import { Scale, Trophy, Sliders, Award } from 'lucide-react';

export default function EvaluationWinnersModule() {
  const { currentRole, categories } = useAwardHub();

  const getDefaultSubTab = () => {
    if (currentRole === 'judge') return 'judge_scoring';
    if (currentRole === 'organizer') return 'hybrid_results';
    if (currentRole === 'voter' || currentRole === 'nominee') return 'published_winners';
    return 'hybrid_results';
  };

  const [activeTab, setActiveTab] = useState(getDefaultSubTab());

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 px-4 py-3 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-purple-950 dark:text-purple-200 font-medium">
          <span className="w-2 h-2 rounded-full bg-purple-600" />
          <span>
            Evaluation, Result Calculation & Winner Management: Blind reviews, weighted rubrics, and automated hybrid standings.
          </span>
        </div>

        {/* View Switcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('judge_scoring')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'judge_scoring'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Scale className="w-3.5 h-3.5 inline mr-1" />
            Judge Blind Scoring
          </button>
          <button
            onClick={() => setActiveTab('hybrid_results')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'hybrid_results'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 inline mr-1" />
            Hybrid Calculation & Publish
          </button>
          <button
            onClick={() => setActiveTab('rubrics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'rubrics'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 inline mr-1" />
            Rubrics & Assignments
          </button>
          <button
            onClick={() => setActiveTab('published_winners')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'published_winners'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Award className="w-3.5 h-3.5 inline mr-1" />
            Official Laureate Hall
          </button>
        </div>
      </div>

      {activeTab === 'judge_scoring' && <JudgeDashboard />}
      {activeTab === 'hybrid_results' && <ResultsPublisher />}
      {activeTab === 'rubrics' && <JudgeAssignmentView />}
      {activeTab === 'published_winners' && <PublicWinnersView />}
    </div>
  );
}
