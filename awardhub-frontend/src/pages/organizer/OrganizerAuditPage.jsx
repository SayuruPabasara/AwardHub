import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { evaluationApi } from '../../api/evaluation';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import SearchBar from '../../components/ui/SearchBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatDateTime } from '../../utils/formatters';

export default function OrganizerAuditPage() {
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAudit();
  }, []);

  const loadAudit = async () => {
    setLoading(true);
    try {
      const data = await evaluationApi.auditTrail();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = events.filter((e) => {
    const act = (e.action || '').toLowerCase();
    const det = (e.detail || e.entityType || '').toLowerCase();
    const s = search.toLowerCase();
    return act.includes(s) || det.includes(s) || String(e.id).includes(s);
  });

  const columns = [
    {
      key: 'id',
      label: 'Audit ID',
      render: (val) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-muted)' }}>
          #{val}
        </span>
      ),
      width: '100px',
    },
    {
      key: 'action',
      label: 'Operation Action',
      render: (val) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {val ? val.replace(/_/g, ' ') : 'ACTION'}
        </span>
      ),
    },
    {
      key: 'actorId',
      label: 'Actor Principal',
      render: (val) => (
        <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>
          {val ? `User #${val}` : 'System Engine'}
        </span>
      ),
    },
    {
      key: 'detail',
      label: 'Operational Audit Details',
      render: (val, row) => (
        <div>
          <span>{val || row.entityType || 'Action logged in audit trail'}</span>
          {row.entityId && (
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Entity Target: #{row.entityId}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'occurredAt',
      label: 'Timestamp (UTC)',
      render: (val) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {formatDateTime(val)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Audit Record',
      render: () => <StatusBadge status="ACTIVE" label="Immutably Sealed" />,
      width: '140px',
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
            Append-only audit events fetched from the MS SQL evaluation_audit_log table
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search audit records..."
          />
          <Button variant="outline" icon={RefreshCw} onClick={loadAudit}>
            Refresh
          </Button>
        </div>
      </div>

      <Card padding="none">
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="No audit records found in database"
          emptyDescription="Audit records will automatically record here as categories are published, nominations submitted, and evaluations graded."
        />
      </Card>
    </div>
  );
}
