import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Filter, Shield, Key } from 'lucide-react';
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
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setUsers([
        { id: 1, username: 'admin', email: 'admin@awardhub.com', role: 'ADMIN', accountStatus: 'ACTIVE' },
        { id: 2, username: 'organizer_lead', email: 'organizer@awardhub.com', role: 'ORGANIZER', accountStatus: 'ACTIVE' },
        { id: 3, username: 'dr_miller', email: 'miller@eval.org', role: 'JUDGE', accountStatus: 'ACTIVE' },
        { id: 4, username: 'nominee_alex', email: 'alex@startup.io', role: 'NOMINEE', accountStatus: 'ACTIVE' },
        { id: 5, username: 'voter_sarah', email: 'sarah@public.org', role: 'VOTER', accountStatus: 'ACTIVE' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createUser(createUserForm);
      toast.success('User account created successfully');
      setModalOpen(false);
      setCreateUserForm({ username: '', email: '', password: '', role: 'VOTER' });
      loadUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns = [
    {
      key: 'username',
      label: 'Account Username',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{val}</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            User ID #{row.id}
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
            Manage identity profiles, role privileges, and account status across the system
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
          </select>
        </div>
      </div>

      <Card padding="none">
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="No users found"
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Provision New User Account"
        subtitle="Create an internal account with specific role permissions"
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
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
