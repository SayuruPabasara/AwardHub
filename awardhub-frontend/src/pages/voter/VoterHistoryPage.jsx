import React, { useState, useEffect } from 'react';
import { History, Trash2, Award, Calendar, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { votesApi } from '../../api/votes';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDateTime } from '../../utils/formatters';

export default function VoterHistoryPage() {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    loadVotes();
  }, []);

  const loadVotes = async () => {
    setLoading(true);
    try {
      const data = await votesApi.mine();
      setVotes(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load voting history');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    try {
      await votesApi.withdraw(withdrawTarget.categoryId);
      toast.success('Vote successfully withdrawn');
      setWithdrawTarget(null);
      loadVotes();
    } catch (err) {
      toast.error(err.message || 'Failed to withdraw vote');
    } finally {
      setWithdrawing(false);
    }
  };

  const columns = [
    {
      key: 'categoryName',
      label: 'Award Category',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{val || row.categoryId}</span>
          {row.categoryCode && (
            <span
              style={{
                display: 'block',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              {row.categoryCode}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'candidateName',
      label: 'Nominee Voted',
      render: (val, row) => (
        <span style={{ fontWeight: 500, color: 'var(--accent-primary)' }}>
          {val || row.nominationTitle || `Nomination #${row.nominationId}`}
        </span>
      ),
    },
    {
      key: 'votedAt',
      label: 'Timestamp',
      render: (val, row) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {formatDateTime(val || row.createdAt)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val || 'RECORDED'} label={val || 'Verified'} />,
    },
    {
      key: 'actions',
      label: 'Action',
      sortable: false,
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          icon={Trash2}
          onClick={() => setWithdrawTarget(row)}
        >
          Withdraw
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          My Voting History
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Audit trail of all ballots cast from your account
        </p>
      </div>

      <Card padding="none">
        <DataTable
          columns={columns}
          data={votes}
          loading={loading}
          emptyMessage="No votes recorded yet"
          emptyDescription="You have not cast any votes for the current award categories."
        />
      </Card>

      <ConfirmDialog
        isOpen={Boolean(withdrawTarget)}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={handleWithdraw}
        title="Withdraw Ballot"
        message="Are you sure you want to withdraw your vote for this category? You may cast a new vote before the deadline closes."
        confirmText="Withdraw Vote"
        variant="danger"
        loading={withdrawing}
      />
    </div>
  );
}
