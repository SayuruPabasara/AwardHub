import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import CategoryManagerModal from './CategoryManagerModal';
import { 
  Award, 
  FileText, 
  Vote, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  Calendar, 
  Sliders, 
  Scale,
  Users,
  ChevronRight
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export default function OrganizerDashboard() {
  const { categories, nominations, votes, judgeScores, setActiveTab } = useAwardHub();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategoryToEdit, setSelectedCategoryToEdit] = useState(null);

  const pendingNominations = nominations.filter((n) => n.status === 'Submitted' || n.status === 'Under Review');
  const approvedNominations = nominations.filter((n) => n.status === 'Approved');
  const activeVotingCategories = categories.filter((c) => c.status === 'Voting Active');

  const stages = [
    { num: 1, name: 'Setup', desc: 'Configure events & categories', active: false, done: true },
    { num: 2, name: 'Nominate', desc: 'Nominees submit applications', active: false, done: true },
    { num: 3, name: 'Review & Judge', desc: 'Approve entries & blind scoring', active: true, done: false },
    { num: 4, name: 'Vote', desc: 'Public cast approved ballots', active: true, done: false },
    { num: 5, name: 'Results', desc: 'Hybrid calculations & winners', active: false, done: false }
  ];

  return (
    <div className="space-y-6">
      {/* 5-Stage Connected Lifecycle Bar (From Slide 4 of Proposal) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              Award Lifecycle Pipeline (5 Connected Stages)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              AwardHub guides every nomination through a structured, auditable five-stage pipeline.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
            Active Phase: Review, Judge & Vote
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {stages.map((stage) => (
            <div
              key={stage.num}
              className={`p-3 rounded-xl border relative transition-all ${
                stage.active
                  ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs dark:bg-indigo-950/40 dark:border-indigo-700 dark:ring-indigo-400/20'
                  : stage.done
                  ? 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800/60 dark:border-slate-800 dark:text-slate-300'
                  : 'bg-white border-slate-200/60 opacity-60 dark:bg-slate-900 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    stage.active
                      ? 'bg-indigo-600 text-white'
                      : stage.done
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {stage.done ? '✓' : stage.num}
                </span>
                {stage.active && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200 dark:text-indigo-300 dark:bg-indigo-900 dark:border-indigo-700">
                    Live
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2">{stage.name}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{stage.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Categories"
          value={categories.length}
          subtitle={`${activeVotingCategories.length} currently open for voting`}
          icon={Award}
          color="blue"
        />
        <StatCard
          title="Pending Nominations"
          value={pendingNominations.length}
          subtitle={`${approvedNominations.length} approved & qualified`}
          icon={FileText}
          color={pendingNominations.length > 0 ? 'amber' : 'emerald'}
          trend={pendingNominations.length > 0 ? 'Requires Action' : 'Cleared'}
        />
        <StatCard
          title="Public Votes Cast"
          value={votes.length}
          subtitle="Across active voting categories"
          icon={Vote}
          color="purple"
        />
        <StatCard
          title="Judge Evaluations"
          value={judgeScores.length}
          subtitle="Submitted blind rubric scores"
          icon={Scale}
          color="emerald"
        />
      </div>

      {/* Quick Category Management Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors duration-200">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/40">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Configured Award Categories</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage categories, configure schedules, weights, and monitor progression
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedCategoryToEdit(null);
                setIsCategoryModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Award Category
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Review Nominations ({pendingNominations.length})
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => {
            const catNoms = nominations.filter((n) => n.categoryId === category.id);
            const catApproved = catNoms.filter((n) => n.status === 'Approved');
            const catVotes = votes.filter((v) => v.categoryId === category.id);

            return (
              <div
                key={category.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-sm transition-all bg-white dark:bg-slate-850 dark:bg-slate-900/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {category.code}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{category.name}</h4>
                    </div>
                    <StatusBadge status={category.status} />
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {category.description}
                  </p>

                  {/* Settings pills */}
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium">
                      Mode: <strong className="capitalize">{category.evaluationMode.replace('_', ' ')}</strong>
                    </span>
                    {category.evaluationMode === 'hybrid' && (
                      <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-medium border border-indigo-100 dark:border-indigo-900">
                        Weights: {category.weights?.judge}% Judge / {category.weights?.public}% Public
                      </span>
                    )}
                    <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 font-medium border border-amber-100 dark:border-amber-900 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Voting ends: {formatDate(category.schedules?.votingEnd)}
                    </span>
                  </div>

                  {/* Mini metrics bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Nominations</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{catNoms.length} ({catApproved.length} Appr)</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Judges</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{category.assignedJudges?.length || 0} assigned</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Public Votes</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{catVotes.length} cast</p>
                    </div>
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedCategoryToEdit(category);
                      setIsCategoryModalOpen(true);
                    }}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    Configure / Edit →
                  </button>
                  <button
                    onClick={() => setActiveTab('results')}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    View Standings & Publish →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryToEdit={selectedCategoryToEdit}
      />
    </div>
  );
}
