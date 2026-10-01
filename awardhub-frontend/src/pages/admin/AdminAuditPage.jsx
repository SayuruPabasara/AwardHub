import React, { useState } from 'react';
import { ShieldCheck, Search, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import SearchBar from '../../components/ui/SearchBar';
import { formatDateTime } from '../../utils/formatters';

export default function AdminAuditPage() {
  const [search, setSearch] = useState('');

  const adminLogs = [
    { id: 'SEC-301', event: 'ADMIN_LOGIN_SUCCESS', principal: 'admin', ipAddress: '127.0.0.1', outcome: 'SUCCESS', timestamp: '2026-10-01T04:30:12Z' },
    { id: 'SEC-300', event: 'ACCOUNT_PASSWORD_RESET', principal: 'it_coordinator', ipAddress: '192.168.1.104', outcome: 'SUCCESS', timestamp: '2026-10-01T02:15:44Z' },
    { id: 'SEC-299', event: 'FAILED_AUTHENTICATION', principal: 'unknown_guest', ipAddress: '45.33.32.156', outcome: 'REJECTED', timestamp: '2026-09-30T23:55:01Z' },
    { id: 'SEC-298', event: 'ROLE_ELEVATION_GRANTED', principal: 'admin', ipAddress: '127.0.0.1', outcome: 'SUCCESS', timestamp: '2026-09-30T21:10:00Z' },
    { id: 'SEC-297', event: 'API_KEY_REVOCATION', principal: 'it_coordinator', ipAddress: '192.168.1.104', outcome: 'SUCCESS', timestamp: '2026-09-30T17:40:22Z' },
  ];

  const filtered = adminLogs.filter(
    (l) =>
      l.event.toLowerCase().includes(search.toLowerCase()) ||
      l.principal.toLowerCase().includes(search.toLowerCase()) ||
      l.ipAddress.includes(search)
  );

  const columns = [
    {
      key: 'id',
      label: 'Security ID',
      render: (val) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-muted)' }}>
          {val}
        </span>
      ),
      width: '120px',
    },
    {
      key: 'event',
      label: 'Security Event',
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>,
    },
    {
      key: 'principal',
      label: 'Subject Identity',
      render: (val) => <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>{val}</span>,
    },
    {
      key: 'ipAddress',
      label: 'Remote IP',
      render: (val) => <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{val}</span>,
    },
    {
      key: 'timestamp',
      label: 'Audit Timestamp',
      render: (val) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {formatDateTime(val)}
        </span>
      ),
    },
    {
      key: 'outcome',
      label: 'Outcome',
      render: (val) => (
        <StatusBadge
          status={val === 'SUCCESS' ? 'APPROVED' : 'REJECTED'}
          label={val}
        />
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
            Security & Authentication Audit Trail
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Privileged session actions, IP traces, credential updates, and anomaly logs
          </p>
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter security events..."
        />
      </div>

      <Card padding="none">
        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="No security events match criteria"
        />
      </Card>
    </div>
  );
}
