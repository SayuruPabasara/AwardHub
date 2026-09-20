import React, { useState } from 'react';
import AdminDashboard from '../admin/AdminDashboard';
import AuditLogsView from '../admin/AuditLogsView';
import { ShieldCheck, Users, Sliders } from 'lucide-react';
import { useAwardHub } from '../../context/AwardHubContext';

export default function SystemAdminModule() {
  const { auditLogs } = useAwardHub();
  const [subTab, setSubTab] = useState('users_settings'); // 'users_settings' | 'audit_logs'

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 px-4 py-3 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-rose-950 dark:text-rose-200 font-medium">
          <span className="w-2 h-2 rounded-full bg-rose-600" />
          <span>
            System Administration & Security Governance: RBAC user management, health monitoring, and audit trails.
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSubTab('users_settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'users_settings'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5 inline mr-1" />
            Users & Security Controls
          </button>
          <button
            onClick={() => setSubTab('audit_logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'audit_logs'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
            Audit Trails ({auditLogs.length})
          </button>
        </div>
      </div>

      {subTab === 'users_settings' ? <AdminDashboard /> : <AuditLogsView />}
    </div>
  );
}
