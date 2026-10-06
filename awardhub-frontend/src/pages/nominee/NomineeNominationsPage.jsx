import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Eye, Send, Trash2, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { nominationsApi } from '../../api/nominations';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

export default function NomineeNominationsPage() {
  const navigate = useNavigate();
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    loadNominations();
  }, []);

  const loadNominations = async () => {
    setLoading(true);
    try {
      const data = await nominationsApi.mine();
      setNominations(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load nominations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNomination = async (id) => {
    setSubmittingId(id);
    try {
      await nominationsApi.submit(id);
      toast.success('Nomination officially submitted for review!');
      loadNominations();
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await nominationsApi.delete(deleteTarget.id);
      toast.success('Nomination entry deleted');
      setDeleteTarget(null);
      loadNominations();
    } catch (err) {
      toast.error(err.message || 'Failed to delete nomination');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Nomination Title',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{val || row.projectName || 'Award Submission'}</span>
          <span
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            Ref #{row.id}
          </span>
        </div>
      ),
    },
    {
      key: 'categoryName',
      label: 'Target Award',
      render: (val, row) => val || `Category #${row.categoryId}`,
    },
    {
      key: 'submissionDate',
      label: 'Date Created',
      render: (val, row) => formatDate(val || row.createdAt),
    },
    {
      key: 'status',
      label: 'Review Status',
      render: (val) => <StatusBadge status={val || 'SUBMITTED'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {row.status === 'DRAFT' && (
            <Button
              size="sm"
              variant="primary"
              icon={Send}
              loading={submittingId === row.id}
              onClick={() => handleSubmitNomination(row.id)}
            >
              Submit
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            icon={Trash2}
            onClick={() => setDeleteTarget(row)}
          >
            Delete
          </Button>
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
            My Nominations
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Track application review progress, scores, and committee statuses
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate('/nominee/submit')}
        >
          Submit New Nomination
        </Button>
      </div>

      <Card padding="none">
        <DataTable
          columns={columns}
          data={nominations}
          loading={loading}
          emptyMessage="No nominations found"
          emptyDescription="You have not created or submitted any nominations yet. Click 'Submit New Nomination' to begin."
        />
      </Card>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Nomination"
        message="Are you sure you want to delete this nomination entry? This action is permanent."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
