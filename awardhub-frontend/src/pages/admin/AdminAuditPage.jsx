import React, { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { evaluationApi } from '../../api/evaluation';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import SearchBar from '../../components/ui/SearchBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatDateTime } from '../../utils/formatters';

export default function AdminAuditPage() {
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await evaluationApi.auditTrail();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((l) => {
    const act = (l.action || '').toLowerCase();
    const det = (l.detail || l.entityType || '').toLowerCase();
    const s = search.toLowerCase();
    return act.includes(s) || det.includes(s) || String(l.actorId).includes(s);
  });

  const columns = [
    {
      key: 'id',
      label: 'Security ID',
      render: (val) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-muted)' }}>
          #{val}
        </span>
      ),
      width: '100px',
    },
    {
      key: 'action',
      label: 'Security Event Action',
      render: (val) => <span style={{ fontWeight: 600 }}>{val ? val.replace(/_/g, ' ') : 'EVENT'}</span>,
    },
    {
      key: 'actorId',
      label: 'Subject Identity',
      render: (val) => (
        <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>
          {val ? `User #${val}` : 'System Kernel'}
        </span>
      ),
    },
    {
      key: 'detail',
      label: 'Event Details',
      render: (val, row) => val || row.entityType || 'Action logged to security audit',
    },
    {
      key: 'occurredAt',
      label: 'Audit Timestamp',
      render: (val) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {formatDateTime(val)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Outcome',
      render: () => <StatusBadge status="APPROVED" label="RECORDED" />,
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
            Privileged session actions and immutable logs fetched from the MS SQL database
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Filter security events..."
          />
          <Button variant="outline" icon={RefreshCw} onClick={loadAuditLogs}>
            Refresh
          </Button>
        </div>
      </div>

      <Card padding="none">
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="No security events recorded in database"
          emptyDescription="Audit records will automatically be logged here as users authenticate and perform operations."
        />
      </Card>
    </div>
  );
}
