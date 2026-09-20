import React, { useState } from 'react';
import Modal from '../common/Modal';
import { ShieldCheck, Vote, AlertCircle } from 'lucide-react';

export default function VoterVerificationModal({ 
  isOpen, 
  onClose, 
  candidateToVoteFor, 
  category, 
  onConfirmVote,
  defaultNIC = '',
  defaultEmail = ''
}) {
  const [nic, setNic] = useState(defaultNIC || '200129485732');
  const [email, setEmail] = useState(defaultEmail || 'dinuka.f@student.sliit.lk');
  const [error, setError] = useState('');

  // Sri Lanka NIC Validator:
  // Old format: 9 digits followed by V or X (e.g. 981234567V)
  // New format: 12 digits (e.g. 200129485732)
  const validateNIC = (inputNIC) => {
    const trimmed = inputNIC.trim().toUpperCase();
    const oldRegex = /^[0-9]{9}[VX]$/;
    const newRegex = /^[0-9]{12}$/;
    return oldRegex.test(trimmed) || newRegex.test(trimmed);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!validateNIC(nic)) {
      setError('Please enter a valid National Identity Card (NIC) format (e.g. 200129485732 or 981234567V).');
      return;
    }

    if (!email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    const success = onConfirmVote(nic, email);
    if (success !== false) {
      onClose();
    }
  };

  if (!candidateToVoteFor || !category) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Voter Authentication & NIC Verification"
      subtitle={`Category: ${category.name}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="bg-blue-50/80 dark:bg-blue-950/40 p-3.5 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold block">Vote Integrity Protection</span>
            To prevent duplicate ballots, AwardHub validates unique voter identities via Sri Lankan National Identity Card (NIC) registration.
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Candidate Selected</span>
          <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{candidateToVoteFor.title}</p>
          <p className="text-slate-500 dark:text-slate-400">{candidateToVoteFor.nomineeName} ({candidateToVoteFor.institution})</p>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            National Identity Card (NIC) Number *
          </label>
          <input
            type="text"
            required
            value={nic}
            onChange={(e) => setNic(e.target.value)}
            placeholder="e.g. 200129485732 or 981234567V"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-mono uppercase bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
            Supports 12-digit digital NIC or 9-digit + V/X legacy format
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Registered Email Address *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voter@example.lk"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-mono bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Vote className="w-3.5 h-3.5" />
            Cast Official Vote
          </button>
        </div>
      </form>
    </Modal>
  );
}
