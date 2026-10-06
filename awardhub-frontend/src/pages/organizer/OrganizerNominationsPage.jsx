import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Clock,
  UserCheck,
  FileText,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesApi } from '../../api/categories';
import {
  nominationsApi,
  NOMINATION_STATUSES,
  NOMINATION_STATUS_LABELS,
  NOMINATION_ORGANIZER_TRANSITIONS,
} from '../../api/nominations';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import SearchBar from '../../components/ui/SearchBar';
import { NominationRejectModal } from '../../components/nomination/NominationModal';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { unwrapList, buildCategoryMap } from '../../utils/reportHelpers';

export default function OrganizerNominationsPage() {
  const [nominations, setNominations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [inspectNom, setInspectNom] = useState(null);
  const [rejectingNom, setRejectingNom] = useState(null);
  const [updating, setUpdating] = useState(false);

  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const catsRes = await categoriesApi.list();
      const catList = unwrapList(catsRes);
      setCategories(catList);

      if (catList.length > 0) {
        // Fetch nominations for all categories
        const nomPromises = catList.map((c) =>
          nominationsApi.forCategory(c.id).catch(() => [])
        );
        const results = await Promise.allSettled(nomPromises);
        let allNoms = [];
        results.forEach((r, idx) => {
          if (r.status === 'fulfilled') {
            const list = unwrapList(r.value);
            allNoms = [...allNoms, ...list];
          }
        });

        // Deduplicate by id if needed and sort newest first
        const unique = Array.from(new Map(allNoms.map((n) => [n.id, n])).values());
        unique.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNominations(unique);
      } else {
        setNominations([]);
      }
    } catch (err) {
      toast.error('Failed to load nomination review queue');
      setNominations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Counts by status
  const counts = useMemo(() => {
    const c = { ALL: nominations.length, SUBMITTED: 0, UNDER_REVIEW: 0, APPROVED: 0, REJECTED: 0, DRAFT: 0 };
    nominations.forEach((n) => {
      if (c[n.status] !== undefined) c[n.status] += 1;
    });
    return c;
  }, [nominations]);

  // Review Workflow Handlers
  const handleMoveToReview = async (nomId) => {
    setUpdating(true);
    try {
      await nominationsApi.moveToReview(nomId);
      toast.success('Nomination dossier moved to Under Review');
      setInspectNom(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to update review status');
    } finally {
      setUpdating(false);
    }
  };

  const handleApprove = async (nomId) => {
    setUpdating(true);
    try {
      await nominationsApi.approve(nomId);
      toast.success('Nomination approved for the ballot!');
      setInspectNom(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to approve nomination');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmReject = async (reason) => {
    if (!rejectingNom) return;
    setUpdating(true);
    try {
      await nominationsApi.reject(rejectingNom.id, reason);
      toast.success('Nomination rejected and reason logged');
      setRejectingNom(null);
      setInspectNom(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to reject nomination');
    } finally {
      setUpdating(false);
    }
  };

  // Filtered dataset
  const filtered = useMemo(() => {
    return nominations.filter((nom) => {
      const q = search.trim().toLowerCase();
      const titleMatch = (nom.title || '').toLowerCase().includes(q);
      const descMatch = (nom.description || '').toLowerCase().includes(q);
      const nomineeMatch = String(nom.nomineeId || '').includes(q);
      const idMatch = String(nom.id || '').includes(q);
      const matchesSearch = !q || titleMatch || descMatch || nomineeMatch || idMatch;

      const matchesStatus = statusFilter === 'ALL' || nom.status === statusFilter;
      const matchesCategory =
        selectedCategoryFilter === 'ALL' || String(nom.categoryId) === String(selectedCategoryFilter);

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [nominations, search, statusFilter, selectedCategoryFilter]);

  const columns = [
    {
      key: 'title',
      label: 'Nomination Dossier',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {val || 'Award Dossier'}
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '2px',
            }}
          >
            Ref #{row.id} • Candidate #{row.nomineeId}
          </span>
        </div>
      ),
    },
    {
      key: 'categoryId',
      label: 'Award Category',
      render: (val) => categoryMap[val] || `Category #${val}`,
    },
    {
      key: 'createdAt',
      label: 'Submitted On',
      render: (val) => formatDate(val),
    },
    {
      key: 'status',
      label: 'Review Status',
      render: (val) => (
        <StatusBadge status={val} label={NOMINATION_STATUS_LABELS[val] || val} />
      ),
    },
    {
      key: 'actions',
      label: 'Action',
      sortable: false,
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          icon={Eye}
          onClick={() => setInspectNom(row)}
          aria-label="Inspect nomination dossier"
        >
          Inspect
        </Button>
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
            Nomination Review Queue
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Inspect candidate dossiers, verify criteria, move to review, and approve or reject submissions
          </p>
        </div>
        <Button variant="secondary" icon={RefreshCw} onClick={loadData}>
          Refresh Queue
        </Button>
      </div>

      {/* Queue Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        <StatCard title="Total In Queue" value={counts.ALL} accent="indigo" />
        <StatCard title="Submitted" value={counts.SUBMITTED} accent="blue" />
        <StatCard title="Under Review" value={counts.UNDER_REVIEW} accent="amber" />
        <StatCard title="Approved" value={counts.APPROVED} accent="green" />
        <StatCard title="Rejected" value={counts.REJECTED} accent="purple" />
      </div>

      {/* Toolbar: Search, Category Filter, and Status Filter */}
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
          placeholder="Search by title, description, or candidate ID..."
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {categories.length > 0 && (
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
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
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} style={{ color: 'var(--text-muted)' }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              <option value="ALL">All Statuses ({counts.ALL})</option>
              <option value="SUBMITTED">Submitted ({counts.SUBMITTED})</option>
              <option value="UNDER_REVIEW">Under Review ({counts.UNDER_REVIEW})</option>
              <option value="APPROVED">Approved ({counts.APPROVED})</option>
              <option value="REJECTED">Rejected ({counts.REJECTED})</option>
              <option value="DRAFT">Draft ({counts.DRAFT})</option>
            </select>
          </div>
        </div>
      </div>

      <Card padding="none">
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          onRowClick={(row) => setInspectNom(row)}
          emptyMessage="No nominations found"
          emptyDescription={
            statusFilter !== 'ALL' || selectedCategoryFilter !== 'ALL' || search
              ? 'No candidate nominations match the active filters.'
              : 'No candidate nominations have been submitted for review yet.'
          }
        />
      </Card>

      {/* Inspect & Action Modal */}
      <Modal
        isOpen={Boolean(inspectNom)}
        onClose={() => setInspectNom(null)}
        title="Dossier Review & Decision"
        subtitle={
          inspectNom
            ? `Ref #${inspectNom.id} • Candidate #${inspectNom.nomineeId} • Category: ${
                categoryMap[inspectNom.categoryId] || `Category #${inspectNom.categoryId}`
              }`
            : ''
        }
        size="lg"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <Button variant="secondary" onClick={() => setInspectNom(null)}>
              Close
            </Button>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {inspectNom && inspectNom.status === 'SUBMITTED' && (
                <Button
                  variant="outline"
                  icon={Clock}
                  loading={updating}
                  onClick={() => handleMoveToReview(inspectNom.id)}
                >
                  Move to Review
                </Button>
              )}

              {inspectNom && (inspectNom.status === 'SUBMITTED' || inspectNom.status === 'UNDER_REVIEW') && (
                <>
                  <Button
                    variant="danger"
                    icon={XCircle}
                    loading={updating}
                    onClick={() => setRejectingNom(inspectNom)}
                  >
                    Reject Dossier
                  </Button>
                  <Button
                    variant="success"
                    icon={CheckCircle}
                    loading={updating}
                    onClick={() => handleApprove(inspectNom.id)}
                  >
                    Approve for Ballot
                  </Button>
                </>
              )}
            </div>
          </div>
        }
      >
        {inspectNom && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header summary */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CANDIDATE</span>
                <h4 style={{ margin: '0.1rem 0 0 0', fontSize: '1.1rem', fontWeight: 700 }}>
                  Nominee #{inspectNom.nomineeId}
                </h4>
              </div>
              <StatusBadge
                status={inspectNom.status}
                label={NOMINATION_STATUS_LABELS[inspectNom.status] || inspectNom.status}
                size="md"
              />
            </div>

            {/* Rejection Alert if already rejected */}
            {inspectNom.status === 'REJECTED' && (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--status-error-soft)',
                  border: '1px solid var(--status-error)',
                  display: 'flex',
                  gap: '0.75rem',
                }}
              >
                <AlertTriangle size={20} style={{ color: 'var(--status-error)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h5 style={{ margin: '0 0 0.25rem 0', color: 'var(--status-error)', fontWeight: 700, fontSize: '0.875rem' }}>
                    Rejection Feedback Recorded
                  </h5>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {inspectNom.rejectionReason || 'No rejection reason recorded.'}
                  </p>
                  {inspectNom.reviewedAt && (
                    <span style={{ display: 'block', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Decided on {formatDateTime(inspectNom.reviewedAt)} by Staff #{inspectNom.reviewedBy}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Approval Banner if already approved */}
            {inspectNom.status === 'APPROVED' && (
              <div
                style={{
                  padding: '0.9rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--status-success-soft)',
                  border: '1px solid var(--status-success)',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center',
                }}
              >
                <CheckCircle size={20} style={{ color: 'var(--status-success)', flexShrink: 0 }} />
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--status-success)', fontSize: '0.875rem' }}>
                    Approved and Qualified for Ballot
                  </span>
                  {inspectNom.reviewedAt && (
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Decided on {formatDateTime(inspectNom.reviewedAt)} by Staff #{inspectNom.reviewedBy}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Project / Nomination Title
              </label>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {inspectNom.title}
              </h3>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                Description & Justification Dossier
              </label>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  color: 'var(--text-primary)',
                }}
              >
                {inspectNom.description || 'No description provided.'}
              </div>
            </div>

            {/* Supporting Document */}
            {inspectNom.supportingDocument && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Supporting Document Link
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <FileText size={16} style={{ color: 'var(--accent-primary)' }} />
                  <a
                    href={inspectNom.supportingDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--accent-primary)',
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      wordBreak: 'break-all',
                    }}
                  >
                    {inspectNom.supportingDocument}
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Mandatory Rejection Reason Modal */}
      <NominationRejectModal
        nomination={rejectingNom}
        isOpen={Boolean(rejectingNom)}
        onClose={() => setRejectingNom(null)}
        onConfirm={handleConfirmReject}
        loading={updating}
      />
    </div>
  );
}
