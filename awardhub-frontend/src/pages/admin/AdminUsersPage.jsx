import React, { useState, useEffect } from 'react';
import { UserPlus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/admin';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import SearchBar from '../../components/ui/SearchBar';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    role: 'VOTER',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listUsers();
      const list = Array.isArray(data)
        ? data
        : (Array.isArray(data?.data)
          ? data.data
          : (Array.isArray(data?.content)
            ? data.content
            : []));
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users:', err);
      toast.error(err.message || 'Failed to fetch user accounts from database');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createUser({
        username: createUserForm.username.trim(),
        name: createUserForm.name?.trim() || createUserForm.username.trim(),
        email: createUserForm.email.trim(),
        password: createUserForm.password,
        role: createUserForm.role,
      });
      toast.success('User account created in database successfully');
      setModalOpen(false);
      setCreateUserForm({ username: '', name: '', email: '', password: '', role: 'VOTER' });
      loadUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleResetUserPassword = async (user) => {
    if (!window.confirm(`Issue temporary password reset for ${user.username || user.email}?`)) return;
    try {
      const res = await adminApi.resetPassword(user.id);
      toast.success(res?.message || 'Temporary password issued');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    }
  };

  const handleToggleUserStatus = async (user, activate) => {
    try {
      if (activate) {
        await adminApi.activateUser(user.id);
        toast.success(`User #${user.id} activated`);
      } else {
        if (!window.confirm(`Deactivate account for ${user.username || user.email}?`)) return;
        await adminApi.deactivateUser(user.id);
        toast.success(`User #${user.id} deactivated`);
      }
      loadUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update user status');
    }
  };

  const filtered = users.filter((u) => {
    const q = (search || '').toLowerCase();
    const matchesSearch =
      !q ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.fullName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      String(u.id || '').includes(q);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns = [
    {
      key: 'username',
      label: 'Account Username',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{val || row.fullName || row.email}</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            User ID #{row.id} {row.fullName && row.fullName !== val ? `• ${row.fullName}` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email Address',
      render: (val) => val,
    },
    {
      key: 'role',
      label: 'Access Role',
      render: (val) => <StatusBadge status={val} label={val} />,
    },
    {
      key: 'accountStatus',
      label: 'Account Status',
      render: (val) => <StatusBadge status={val || 'ACTIVE'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleResetUserPassword(row)}
          >
            Reset Password
          </Button>
          {row.accountStatus === 'DEACTIVATED' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleToggleUserStatus(row, true)}
            >
              Activate
            </Button>
          ) : (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleToggleUserStatus(row, false)}
            >
              Deactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
            User Accounts Directory
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Live accounts queried from the MS SQL users table
          </p>
        </div>
        <Button variant="primary" icon={UserPlus} onClick={() => setModalOpen(true)}>
          Create User Account
        </Button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter by username or email..."
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="ORGANIZER">ORGANIZER</option>
            <option value="JUDGE">JUDGE</option>
            <option value="NOMINEE">NOMINEE</option>
            <option value="VOTER">VOTER</option>
            <option value="IT_COORDINATOR">IT_COORDINATOR</option>
            <option value="AUDIT">AUDIT</option>
          </select>
        </div>
      </div>

      <Card padding="none">
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="No users found in database"
          emptyDescription="User accounts registered in the database will appear here."
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Provision New User Account"
        subtitle="Create an account directly in the MS SQL users table"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateUser} loading={saving}>
              Create Account
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Username *
            </label>
            <input
              type="text"
              value={createUserForm.username}
              onChange={(e) => setCreateUserForm({ ...createUserForm, username: e.target.value })}
              placeholder="e.g. lead_judge"
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Full Name
            </label>
            <input
              type="text"
              value={createUserForm.name}
              onChange={(e) => setCreateUserForm({ ...createUserForm, name: e.target.value })}
              placeholder="e.g. Dr. Alex Morgan"
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Email Address *
            </label>
            <input
              type="email"
              value={createUserForm.email}
              onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
              placeholder="judge@institution.org"
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Temporary Password *
            </label>
            <input
              type="password"
              value={createUserForm.password}
              onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Assigned Role
            </label>
            <select
              value={createUserForm.role}
              onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            >
              <option value="VOTER">VOTER</option>
              <option value="NOMINEE">NOMINEE</option>
              <option value="ORGANIZER">ORGANIZER</option>
              <option value="JUDGE">JUDGE</option>
              <option value="ADMIN">ADMIN</option>
              <option value="IT_COORDINATOR">IT_COORDINATOR</option>
              <option value="AUDIT">AUDIT</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
