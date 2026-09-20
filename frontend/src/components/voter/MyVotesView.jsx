import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import { Vote, RotateCcw, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export default function MyVotesView() {
  const { votes, categories, nominations, currentUser, withdrawVote, updateVote, setActiveTab } = useAwardHub();

  const [selectedChangeVote, setSelectedChangeVote] = useState(null);
  const [newSelectionId, setNewSelectionId] = useState('');

  // Get all votes for current voter's NIC
  const myVotes = votes.filter((v) => v.voterNIC === currentUser?.nic);

  const handleWithdraw = (catId) => {
    if (window.confirm('Are you sure you want to retract your vote from this category? You can re-vote prior to the deadline.')) {
      withdrawVote(catId, currentUser.nic);
    }
  };

  const handleOpenChange = (vote) => {
    setSelectedChangeVote(vote);
    setNewSelectionId(vote.nomineeId);
  };

  const handleConfirmChange = (e) => {
    e.preventDefault();
    if (!selectedChangeVote || !newSelectionId) return;

    updateVote(selectedChangeVote.categoryId, newSelectionId, currentUser.nic);
    setSelectedChangeVote(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">My Cast Ballots & Vote History</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Authenticated voter identity: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{currentUser?.nic}</span>
          </p>
        </div>
        <button
          onClick={() => setActiveTab('ballot')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
        >
          <Vote className="w-4 h-4" />
          Browse Active Categories
        </button>
      </div>

      {myVotes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center text-xs">
          <Vote className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">No Votes Cast Yet</h4>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            You haven't participated in any active category ballots. Cast your vote to support innovative projects!
          </p>
          <button
            onClick={() => setActiveTab('ballot')}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
          >
            Go to Voting Ballot
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Selected Candidate</th>
                  <th className="px-4 py-3">Ballot Timestamp</th>
                  <th className="px-4 py-3">Audit Verification IP</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {myVotes.map((vote) => {
                  const cat = categories.find((c) => c.id === vote.categoryId);
                  const candidate = nominations.find((n) => n.id === vote.nomineeId);

                  return (
                    <tr key={vote.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {cat?.name || 'Category'}
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-mono">{cat?.code}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-indigo-700 dark:text-indigo-400">{candidate?.title || 'Unknown candidate'}</span>
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400">{candidate?.nomineeName}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDateTime(vote.castAt)}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                        {vote.ipAddress || '192.248.32.14'}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenChange(vote)}
                          className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition-colors"
                        >
                          Change Choice
                        </button>
                        <button
                          onClick={() => handleWithdraw(vote.categoryId)}
                          className="px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-semibold border border-rose-200 dark:border-rose-800 transition-colors"
                        >
                          Withdraw Vote
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Change Vote Modal */}
      {selectedChangeVote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Change Candidate Selection</h4>
            <p className="text-slate-500 dark:text-slate-400">
              Select an alternative approved candidate in this category to transfer your ballot:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {nominations
                .filter((n) => n.categoryId === selectedChangeVote.categoryId && n.status === 'Approved')
                .map((cand) => (
                  <label
                    key={cand.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      newSelectionId === cand.id
                        ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 ring-2 ring-blue-400/20'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="newVoteChoice"
                      value={cand.id}
                      checked={newSelectionId === cand.id}
                      onChange={(e) => setNewSelectionId(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-100 block">{cand.title}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{cand.nomineeName}</span>
                    </div>
                  </label>
                ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedChangeVote(null)}
                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmChange}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
              >
                Update My Ballot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
