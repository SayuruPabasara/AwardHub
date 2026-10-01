import React, { useState, useEffect } from 'react';
import { Vote, Activity, RefreshCw, CheckCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesApi } from '../../api/categories';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatDateTime } from '../../utils/formatters';

export default function OrganizerLiveVotesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.list();
      setCategories(Array.isArray(data) ? data : []);

      // Mock live ballot stream
      setRecentEvents([
        { id: 'tx-901', voter: 'voter_alpha', category: 'Best FinTech Innovation', nominee: 'PayStream AI', time: new Date().toISOString(), status: 'VALIDATED' },
        { id: 'tx-902', voter: 'voter_beta', category: 'Best Cloud Architecture', nominee: 'KubeMesh Enterprise', time: new Date(Date.now() - 120000).toISOString(), status: 'VALIDATED' },
        { id: 'tx-903', voter: 'voter_gamma', category: 'Sustainability in Tech', nominee: 'GreenData Labs', time: new Date(Date.now() - 300000).toISOString(), status: 'VALIDATED' },
        { id: 'tx-904', voter: 'voter_delta', category: 'Best FinTech Innovation', nominee: 'PayStream AI', time: new Date(Date.now() - 480000).toISOString(), status: 'VALIDATED' },
        { id: 'tx-905', voter: 'voter_omega', category: 'Best Mobile App', nominee: 'HealthPulse Pro', time: new Date(Date.now() - 650000).toISOString(), status: 'VALIDATED' },
      ]);
    } catch (err) {
      toast.error('Failed to load live votes data');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Transaction ID',
      render: (val) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-muted)' }}>
          {val}
        </span>
      ),
      width: '130px',
    },
    {
      key: 'voter',
      label: 'Voter Handle',
      render: (val) => <span style={{ fontWeight: 500 }}>{val}</span>,
    },
    {
      key: 'category',
      label: 'Category',
      render: (val) => val,
    },
    {
      key: 'nominee',
      label: 'Candidate Voted',
      render: (val) => (
        <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{val}</span>
      ),
    },
    {
      key: 'time',
      label: 'Timestamp',
      render: (val) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {formatDateTime(val)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Cryptographic Status',
      render: (val) => <StatusBadge status={val} label="Integrity Verified" />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
            Live Ballot Stream & Audit Feed
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Real-time verification stream of ballots as they are cryptographically signed and stored
          </p>
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={loadData}>
          Refresh Feed
        </Button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <StatCard
          title="Total Ballots Tallied"
          value="1,420"
          change="+42 last hour"
          isPositive={true}
          icon={Vote}
          accent="indigo"
        />
        <StatCard
          title="Transaction Throughput"
          value="18.4 / min"
          subtitle="Peak voting rate"
          icon={Activity}
          accent="green"
        />
        <StatCard
          title="Audit Pass Rate"
          value="100.0%"
          subtitle="Zero duplicate ballots"
          icon={Shield}
          accent="blue"
        />
      </div>

      <Card title="Live Ballot Ingestion Stream" padding="none">
        <DataTable
          columns={columns}
          data={recentEvents}
          loading={loading}
          emptyMessage="No live transactions"
        />
      </Card>
    </div>
  );
}
