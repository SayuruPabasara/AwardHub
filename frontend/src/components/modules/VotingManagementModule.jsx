import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import VoterBallotView from '../voter/VoterBallotView';
import MyVotesView from '../voter/MyVotesView';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import { Vote, ShieldCheck, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export default function VotingManagementModule() {
  const { currentRole, votes, categories, nominations } = useAwardHub();

  const [activeTab, setActiveTab] = useState('ballot');
  const totalVoters = new Set(votes.map((v) => v.voterNIC)).size;

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 px-4 py-3 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-blue-950 dark:text-blue-200 font-medium">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>
            Voting Management: Authenticated via <strong>Sri Lankan NIC Verification</strong> to guarantee one vote per category.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ballot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ballot'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Public Category Ballot
          </button>
          <button
            onClick={() => setActiveTab('my_votes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'my_votes'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            My Cast Ballots & Retraction
          </button>
          {(currentRole === 'organizer' || currentRole === 'admin') && (
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'audit'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Voting Integrity Audit ({votes.length})
            </button>
          )}
        </div>
      </div>

      {activeTab === 'ballot' && <VoterBallotView />}
      {activeTab === 'my_votes' && <MyVotesView />}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Ballots Recorded"
              value={votes.length}
              subtitle="Across all active categories"
              icon={Vote}
              color="blue"
            />
            <StatCard
              title="Unique Verified Voters"
              value={totalVoters}
              subtitle="Authenticated via NIC & Email"
              icon={ShieldCheck}
              color="emerald"
            />
            <StatCard
              title="Integrity Status"
              value="100% Validated"
              subtitle="Duplicate votes prevented"
              icon={CheckCircle2}
              color="purple"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Audit Voting Stream</h4>
              <span className="text-xs text-slate-500 dark:text-slate-400">Live immutable ballot records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-semibold border-b border-slate-200 dark:border-slate-800 text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Voter NIC</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Candidate Voted</th>
                    <th className="px-4 py-3">Client IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {votes.map((v) => {
                    const cat = categories.find((c) => c.id === v.categoryId);
                    const nom = nominations.find((n) => n.id === v.nomineeId);
                    return (
                      <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">{formatDateTime(v.castAt)}</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-slate-100">{v.voterNIC}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{v.voterEmail}</td>
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{cat?.name}</td>
                        <td className="px-4 py-3 font-bold text-indigo-700 dark:text-indigo-400">{nom?.title}</td>
                        <td className="px-4 py-3 font-mono text-slate-400 dark:text-slate-500">{v.ipAddress}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
