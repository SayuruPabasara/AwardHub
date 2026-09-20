import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import { ShieldCheck, Search, Filter, Download, Calendar } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export default function AuditLogsView() {
  const { auditLogs, showToast } = useAwardHub();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterModule, setFilterModule] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === 'all' || log.role.toLowerCase() === filterRole.toLowerCase();
    const matchesModule = filterModule === 'all' || log.module === filterModule;

    return matchesSearch && matchesRole && matchesModule;
  });

  const handleExportAuditLogs = () => {
    let csv = 'data:text/csv;charset=utf-8,Timestamp,Actor,Role,Module,Action,TargetID,Details\n';
    filteredLogs.forEach((l) => {
      csv += `"${l.timestamp}","${l.actor}","${l.role}","${l.module}","${l.action}","${l.targetId}","${l.details}"\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AwardHub_AuditTrail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit trail exported successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">System Audit Trails & Compliance Logs</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Immutable Records
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full accountability and transparency trail tracking nominations, evaluations, votes, and result publications.
          </p>
        </div>

        <button
          onClick={handleExportAuditLogs}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs transition-colors whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          Export Audit Trail (CSV)
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, actor, or details..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Stakeholder Roles</option>
            <option value="award organizer">Award Organizer</option>
            <option value="nominee">Nominee</option>
            <option value="judge">Judge</option>
            <option value="public voter">Public Voter</option>
            <option value="system administrator">System Administrator</option>
          </select>
        </div>

        <div>
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All System Modules</option>
            <option value="Award Category Management">Award Category Management</option>
            <option value="Nomination Management">Nomination Management</option>
            <option value="Nominee Profile Management">Nominee Profile Management</option>
            <option value="Voting Management">Voting Management</option>
            <option value="Evaluation & Scoring">Evaluation & Scoring</option>
            <option value="Result Calculation & Winner Management">Result Calculation & Winners</option>
            <option value="User Account Management">User Account Management</option>
            <option value="Feedback Management">Feedback Management</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 uppercase font-semibold border-b border-slate-200 dark:border-slate-800 text-[11px]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor & Role</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target ID</th>
                <th className="px-4 py-3">Details & Parameters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                    No audit records match the current filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-bold text-slate-900 dark:text-white block">{log.actor}</span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">{log.role}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{log.module}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {log.targetId}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-sm truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
