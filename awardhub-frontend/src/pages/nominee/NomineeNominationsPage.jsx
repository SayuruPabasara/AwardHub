import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Eye, Send, Trash2, Edit3, AlertTriangle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { nominationsApi, NOMINATION_STATUS_LABELS } from '../../api/nominations';
import { categoriesApi } from '../../api/categories';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { NominationViewModal, NominationEditModal } from '../../components/nomination/NominationModal';
import { formatDate } from '../../utils/formatters';
import { unwrapList, buildCategoryMap } from '../../utils/reportHelpers';

export default function NomineeNominationsPage() {
  const navigate = useNavigate();
  const [nominations, setNominations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewTarget, setViewTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);

  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories]);

  useEffect(() => {
    categoriesApi
      .listPublic()
      .then((res) => setCategories(unwrapList(res)))
      .catch(() => setCategories([]));
  }, []);

  const loadNominations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await nominationsApi.mine();
      const list = unwrapList(data);
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNominations(list);
    } catch (err) {
      toast.error(err.message || 'Failed to load nominations');
      setNominations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNominations();
  }, [loadNominations]);

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
    setDeleting(true);
    try {
      await nominationsApi.delete(deleteTarget.id);
      toast.success('Draft nomination deleted');
      setDeleteTarget(null);
      loadNominations();
    } catch (err) {
      toast.error(err.message || 'Failed to delete nomination');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Nomination Dossier',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {val || 'Award Submission'}
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '2px',
            }}
          >
            Ref #{row.id} • {categoryMap[row.categoryId] || `Category #${row.categoryId}`}
          </span>
          {row.status === 'REJECTED' && row.rejectionReason && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                color: 'var(--status-error)',
                marginTop: '4px',
              }}
            >
              <AlertTriangle size={12} /> Rejection: {row.rejectionReason.slice(0, 60)}
              {row.rejectionReason.length > 60 ? '…' : ''}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'categoryId',
      label: 'Category',
      render: (val) => categoryMap[val] || `Category #${val}`,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (val) => formatDate(val),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <StatusBadge status={val} label={NOMINATION_STATUS_LABELS[val] || val} />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <Button
            size="sm"
            variant="ghost"
            icon={Eye}
            onClick={() => setViewTarget(row)}
            aria-label="View nomination"
          >
            View
          </Button>

          {row.status === 'DRAFT' && (
            <>
              <Button
                size="sm"
                variant="outline"
                icon={Edit3}
                onClick={() => setEditTarget(row)}
                aria-label="Edit draft"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={Send}
                loading={submittingId === row.id}
                onClick={() => handleSubmitNomination(row.id)}
                aria-label="Submit nomination"
              >
                Submit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={Trash2}
                onClick={() => setDeleteTarget(row)}
                aria-label="Delete draft"
                style={{ color: 'var(--status-error)' }}
              >
                Delete
              </Button>
            </>
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
            My Nominations
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Track your candidate dossiers, submission statuses, and committee review decisions
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" icon={RefreshCw} onClick={loadNominations}>
            Refresh
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/nominee/submit')}
          >
            Submit New Nomination
          </Button>
        </div>
      </div>

      <Card padding="none">
        <DataTable
          columns={columns}
          data={nominations}
          loading={loading}
          onRowClick={(row) => setViewTarget(row)}
          emptyMessage="No nominations found"
          emptyDescription="You have not created or submitted any nominations yet. Click 'Submit New Nomination' to get started."
        />
      </Card>

      {/* View Modal */}
      <NominationViewModal
        nomination={viewTarget}
        categoryName={viewTarget ? categoryMap[viewTarget.categoryId] : ''}
        isOpen={Boolean(viewTarget)}
        onClose={() => setViewTarget(null)}
      />

      {/* Edit Modal (Drafts only) */}
      <NominationEditModal
        nomination={editTarget}
        isOpen={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        onUpdated={loadNominations}
      />

      {/* Delete Confirmation (Drafts only) */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Draft Nomination"
        message={
          deleteTarget
            ? `Are you sure you want to permanently delete draft "${deleteTarget.title}" (Ref #${deleteTarget.id})?`
            : ''
        }
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
