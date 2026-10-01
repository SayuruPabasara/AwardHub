import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Search, Eye, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { nominationsApi } from '../../api/nominations';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import SearchBar from '../../components/ui/SearchBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

export default function OrganizerNominationsPage() {
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedNom, setSelectedNom] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadNominations();
  }, []);

  const loadNominations = async () => {
    setLoading(true);
    try {
      const data = await nominationsApi.mine(); // will fetch all or user scope
      setNominations(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load nominations');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (nomId, newStatus) => {
    setUpdating(true);
    try {
      await nominationsApi.update(nomId, { status: newStatus });
      toast.success(`Nomination status changed to ${newStatus}`);
      setSelectedNom(null);
      loadNominations();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = nominations.filter((nom) => {
    const matchesSearch =
      (nom.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (nom.nomineeName || '').toLowerCase().includes(search.toLowerCase()) ||
      (nom.organization || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || nom.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'title',
      label: 'Nomination Dossier',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{val || 'Project Title'}</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Candidate: {row.nomineeName || 'Unnamed'} {row.organization ? `• ${row.organization}` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'categoryName',
      label: 'Category',
      render: (val, row) => val || `Category #${row.categoryId}`,
    },
    {
      key: 'submissionDate',
      label: 'Submitted On',
      render: (val, row) => formatDate(val || row.createdAt),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val || 'SUBMITTED'} />,
    },
    {
      key: 'actions',
      label: 'Review',
      sortable: false,
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          icon={Eye}
          onClick={() => setSelectedNom(row)}
        >
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          Nomination Review Queue
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Evaluate applicant dossiers, verify evidence documents, and qualify nominees for voting
        </p>
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
          placeholder="Filter by candidate, title, org..."
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
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
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved (Finalist)</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <Card padding="none">
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="No nominations found"
          emptyDescription="There are no candidate nominations matching the selected filter."
        />
      </Card>

      {/* Inspect / Approve / Reject Modal */}
      <Modal
        isOpen={Boolean(selectedNom)}
        onClose={() => setSelectedNom(null)}
        title="Dossier Review & Qualification"
        subtitle={`Nomination ID #${selectedNom?.id}`}
        size="lg"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="danger"
              icon={XCircle}
              loading={updating}
              onClick={() => handleUpdateStatus(selectedNom?.id, 'REJECTED')}
            >
              Reject Dossier
            </Button>
            <Button
              variant="success"
              icon={CheckCircle}
              loading={updating}
              onClick={() => handleUpdateStatus(selectedNom?.id, 'APPROVED')}
            >
              Approve for Ballot
            </Button>
          </div>
        }
      >
        {selectedNom && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CANDIDATE</span>
                <h3 style={{ margin: '0.2rem 0', fontSize: '1.25rem', fontWeight: 700 }}>
                  {selectedNom.nomineeName}
                </h3>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {selectedNom.organization || 'Independent Candidate'}
                </span>
              </div>
              <StatusBadge status={selectedNom.status || 'SUBMITTED'} size="md" />
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                PROJECT TITLE
              </span>
              <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600 }}>{selectedNom.title}</p>
            </div>

            <div>
              <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.9rem', fontWeight: 600 }}>
                Executive Summary
              </h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {selectedNom.summary || 'No summary provided.'}
              </p>
            </div>

            {selectedNom.achievements && (
              <div>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.9rem', fontWeight: 600 }}>
                  Key Achievements & Credentials
                </h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {selectedNom.achievements}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
