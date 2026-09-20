import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import NomineeProfileView from '../nominee/NomineeProfileView';
import { User, FileText, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react';

export default function NomineeProfileModule() {
  const { currentRole, users, nominations } = useAwardHub();

  // Nominee view: personal profile management & document vault
  if (currentRole === 'nominee') {
    return <NomineeProfileView />;
  }

  // Non-nominees: Candidate Directory & Credential Auditing View
  const nomineeUsers = users.filter((u) => u.role === 'nominee');

  return (
    <div className="space-y-6">
      {/* Role Context Bar */}
      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <span>
            Candidate Registry & Credential Audit: Viewing verified profiles as <strong>{currentRole.toUpperCase()}</strong>.
          </span>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
          {nomineeUsers.length} Registered Nominees
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nomineeUsers.map((nominee) => {
          const theirNoms = nominations.filter((n) => n.nomineeId === nominee.id || n.nomineeName === nominee.name);

          return (
            <div
              key={nominee.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all"
            >
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={nominee.avatar}
                    alt={nominee.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-50 dark:ring-indigo-950"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{nominee.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{nominee.department}</p>
                    <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900">
                      ID: {nominee.studentId || 'IT25101477'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                  {nominee.bio}
                </p>

                {/* Achievements */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Verified Achievements:</span>
                  {nominee.achievements?.map((ach, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{ach}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{nominee.documents?.length || 0} Vault Documents</span>
                <span className="font-semibold text-indigo-700 dark:text-indigo-400">{theirNoms.length} Submitted Nominations</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
