import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import SubmitNominationModal from './SubmitNominationModal';
import { 
  FileText, 
  CheckCircle2, 
  Vote, 
  Award, 
  Plus, 
  ArrowRight, 
  User, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export default function NomineeDashboard() {
  const { currentUser, nominations, categories, setActiveTab } = useAwardHub();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const myNominations = nominations.filter(
    (n) => n.nomineeId === currentUser.id || n.nomineeName === currentUser.name
  );

  const approvedNoms = myNominations.filter((n) => n.status === 'Approved');
  const totalPublicVotes = approvedNoms.reduce((sum, n) => sum + (n.stats?.publicVotes || 0), 0);
  const openCategories = categories.filter((c) => c.status === 'Nomination Open' || c.status === 'Voting Active');

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
            Nominee Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            Welcome back, {currentUser.name}!
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Manage your academic and technical profiles, assemble supporting documentation dossiers, and submit your innovations for institutional recognition.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              Apply for Award Nomination
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all"
            >
              <User className="w-4 h-4 text-amber-300" />
              Update Dossier & Vault
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Submitted Nominations"
          value={myNominations.length}
          subtitle={`${approvedNoms.length} approved & qualified`}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Public Support & Votes"
          value={totalPublicVotes}
          subtitle="Votes received on qualified entries"
          icon={Vote}
          color="amber"
        />
        <StatCard
          title="Document Vault Assets"
          value={currentUser.documents?.length || 0}
          subtitle="Verified PDFs & whitepapers ready"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Active Nominations Status Quick Tracker */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors duration-200">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Your Active Submissions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live progress of your current nominations</p>
          </div>
          <button
            onClick={() => setActiveTab('my-nominations')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
          >
            View All Submissions <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {myNominations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              You have no active nominations. Click "Apply for Award Nomination" to get started!
            </div>
          ) : (
            myNominations.map((nom) => (
              <div key={nom.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                      {nom.categoryName}
                    </span>
                    <StatusBadge status={nom.status} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{nom.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xl">{nom.summary}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold">Public Votes</span>
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{nom.stats?.publicVotes || 0}</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('my-nominations')}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Open Categories to Apply */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Open Award Categories</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Categories currently accepting applications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {openCategories.map((cat) => (
            <div key={cat.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {cat.code}
                  </span>
                  <StatusBadge status={cat.status} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">{cat.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{cat.description}</p>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium mt-2">
                  <strong>Eligibility:</strong> {cat.eligibility}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Nomination ends: {formatDate(cat.schedules?.nominationEnd)}
                </span>
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  Submit Application →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SubmitNominationModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </div>
  );
}
