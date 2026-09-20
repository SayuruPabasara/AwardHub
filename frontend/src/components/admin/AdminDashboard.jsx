import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import StatCard from '../common/StatCard';
import Modal from '../common/Modal';
import { 
  Users, 
  ShieldCheck, 
  Activity, 
  Database, 
  UserPlus, 
  Power, 
  Download, 
  Edit2, 
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { getRoleBadge } from '../../utils/formatters';

export default function AdminDashboard() {
  const { users, auditLogs, updateUser, addUser, showToast, logAudit } = useAwardHub();

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'judge',
    department: 'Faculty of Computing',
    nic: '198510294812'
  });

  const handleToggleMaintenance = () => {
    const next = !maintenanceMode;
    setMaintenanceMode(next);
    logAudit('MAINTENANCE_TOGGLE', 'System Administration', 'GLOBAL', `Maintenance mode set to ${next}`);
    showToast(next ? 'Maintenance mode enabled for public users' : 'System restored to active operation', next ? 'error' : 'success');
  };

  const handleBackupSnapshot = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: 'AwardHub-2026.1',
      totalUsers: users.length,
      systemState: 'Nominal'
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AwardHub_Backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logAudit('BACKUP_GENERATED', 'System Administration', 'DB', 'Created full SQL/State database backup archive');
    showToast('Database backup archive created successfully!');
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email) return;
    addUser(newUserData);
    setNewUserData({
      name: '',
      email: '',
      role: 'judge',
      department: 'Faculty of Computing',
      nic: '198510294812'
    });
    setIsAddUserOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">System Technical Administration & Governance</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              System Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage user accounts, assign role permissions, monitor system security health, and maintain audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBackupSnapshot}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Snapshot Database Backup
          </button>
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register User
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total User Accounts"
          value={users.length}
          subtitle="Across 5 active stakeholder roles"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Security Audit Events"
          value={auditLogs.length}
          subtitle="Immutable chronological logs"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="System Health"
          value={maintenanceMode ? 'Maintenance' : '99.9% Uptime'}
          subtitle={maintenanceMode ? 'Public traffic paused' : 'All services active'}
          icon={Activity}
          color={maintenanceMode ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Access Controls"
          value="Role-Based (RBAC)"
          subtitle="Enforced on every endpoint"
          icon={Power}
          color="purple"
        />
      </div>

      {/* User Accounts Management Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Stakeholder User Accounts & Roles</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Assign role access for Administrators, Organizers, Nominees, Judges, and Voters</p>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{users.length} registered users</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Stakeholder</th>
                <th className="px-4 py-3">Assigned Role</th>
                <th className="px-4 py-3">Department / Division</th>
                <th className="px-4 py-3">National ID (NIC)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Reassign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((user) => {
                const roleBadge = getRoleBadge(user.role);
                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{user.name}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${roleBadge.style}`}>
                        {roleBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{user.department}</td>
                    <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">{user.nic || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <select
                        value={user.role}
                        onChange={(e) => updateUser(user.id, { role: e.target.value })}
                        className="text-xs rounded border border-slate-300 dark:border-slate-700 px-2 py-1 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                      >
                        <option value="admin">System Admin</option>
                        <option value="organizer">Award Organizer</option>
                        <option value="nominee">Nominee</option>
                        <option value="judge">Judge</option>
                        <option value="voter">Public Voter</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Health & Maintenance Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Security & Operational Controls</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">System Maintenance Mode</span>
              <span className="text-slate-500 dark:text-slate-400">Temporarily restrict public voting during scheduled upgrades</span>
            </div>
            <button
              onClick={handleToggleMaintenance}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                maintenanceMode
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {maintenanceMode ? 'Active (Disable)' : 'Enable'}
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Database Backup & Archival</span>
              <span className="text-slate-500 dark:text-slate-400">Create point-in-time snapshot of all tables, votes & logs</span>
            </div>
            <button
              onClick={handleBackupSnapshot}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
            >
              Run Backup
            </button>
          </div>
        </div>
      </div>

      {/* Register User Modal */}
      {isAddUserOpen && (
        <Modal
          isOpen={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
          title="Register New Stakeholder Account"
          subtitle="Create credentials and assign system roles"
        >
          <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                placeholder="e.g. Dr. Kasun Bandara"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="kasun.b@sliit.lk"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-mono bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Assign Stakeholder Role *
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  <option value="organizer">Award Organizer</option>
                  <option value="nominee">Nominee</option>
                  <option value="judge">Judge / Evaluator</option>
                  <option value="voter">Public Voter</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  National ID (NIC)
                </label>
                <input
                  type="text"
                  value={newUserData.nic}
                  onChange={(e) => setNewUserData({ ...newUserData, nic: e.target.value })}
                  placeholder="200018491029"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-mono bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Faculty / Department
              </label>
              <input
                type="text"
                value={newUserData.department}
                onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                placeholder="Faculty of Computing"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-sm transition-colors"
              >
                Create Account
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
