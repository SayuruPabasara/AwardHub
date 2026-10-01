import React, { useState } from 'react';
import { ShieldCheck, Filter, Search, Download } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import SearchBar from '../../components/ui/SearchBar';
import { formatDateTime } from '../../utils/formatters';

export default function OrganizerAuditPage() {
  const [search, setSearch] = useState('');

  const auditEvents = [
    { id: 'EVT-1092', action: 'NOMINATION_APPROVED', actor: 'organizer_main', details: 'Nomination #42 approved for final balloting', timestamp: '2026-10-01T04:15:20Z', severity: 'INFO' },
    { id: 'EVT-1091', action: 'CATEGORY_DEADLINE_EXTENDED', actor: 'organizer_main', details: 'Best FinTech deadline moved to 2026-10-15', timestamp: '2026-10-01T02:00:10Z', severity: 'WARNING' },
    { id: 'EVT-1090', action: 'JUDGE_ASSIGNED', actor: 'organizer_lead', details: 'Dr. Miller assigned to Cloud Architecture panel', timestamp: '2026-09-30T18:42:00Z', severity: 'INFO' },
    { id: 'EVT-1089', action: 'BALLOT_LOCK_ENGAGED', actor: 'system_daemon', details: 'Voter balloting closed for Health category', timestamp: '2026-09-30T16:00:00Z', severity: 'INFO' },
    { id: 'EVT-1088', action: 'RUBRIC_CALIBRATED', actor: 'organizer_main', details: 'Criterion "Innovation" weight updated to 35%', timestamp: '2026-09-29T11:22:15Z', severity: 'INFO' },
  ];

  const filtered = auditEvents.filter(
    (e) =>
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.details.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'id',
      label: 'Event Ref',
      render: (val) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-muted)' }}>
          {val}
        </span>
      ),
      width: '120px',
    },
    {
      key: 'action',
      label: 'Operation Action',
      render: (val) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {val.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'actor',
      label: 'Operator / Principal',
      render: (val) => <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>{val}</span>,
    },
    {
      key: 'details',
      label: 'Audit Log Details',
      render: (val) => <span style={{ color: 'var(--text-secondary)' }}>{val}</span>,
    },
    {
      key: 'timestamp',
      label: 'Timestamp (UTC)',
      render: (val) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {formatDateTime(val)}
        </span>
      ),
    },
    {
      key: 'severity',
      label: 'Audit Level',
      render: (val) => <StatusBadge status={val === 'WARNING' ? 'PENDING' : 'APPROVED'} label={val} />,
      width: '100px',
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
            Audit Trail & Event Log
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Cryptographically sealed operational audit record for compliance & governance
          </p>
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter audit events..."
        />
      </div>

      <Card padding="none">
        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="No audit records match"
        />
      </Card>
    </div>
  );
}
