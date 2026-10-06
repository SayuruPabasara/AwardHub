import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesApi } from '../../api/categories';
import { nominationsApi } from '../../api/nominations';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import SearchBar from '../../components/ui/SearchBar';
import { formatDate } from '../../utils/formatters';

export default function OrganizerNominationsPage() {
  const [nominations, setNominations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
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
      const cats = await categoriesApi.list();
      const catList = Array.isArray(cats) ? cats : [];
      setCategories(catList);

      if (catList.length > 0) {
        const nomPromises = catList.map((c) =>
          nominationsApi.forCategory(c.id).catch(() => [])
        );
        const results = await Promise.allSettled(nomPromises);
        let allNoms = [];
        results.forEach((r, idx) => {
          if (r.status === 'fulfilled' && Array.isArray(r.value)) {
            const mapped = r.value.map((nom) => ({
              ...nom,
              categoryName: catList[idx]?.name || `Category #${nom.categoryId}`,
            }));
            allNoms = [...allNoms, ...mapped];
          }
        });
        setNominations(allNoms);
      } else {
        setNominations([]);
      }
    } catch (err) {
      console.error(err);
      setNominations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (nomId, newStatus) => {
    setUpdating(true);
    try {
      if (newStatus === 'APPROVED') {
        await nominationsApi.approve(nomId);
      } else if (newStatus === 'REJECTED') {
        await nominationsApi.reject(nomId, 'Rejected during review');
      } else {
        await nominationsApi.update(nomId, { status: newStatus });
      }
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
    const titleMatch = (nom.title || '').toLowerCase().includes(search.toLowerCase());
    const descMatch = (nom.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesSearch = titleMatch || descMatch || String(nom.nomineeId).includes(search);
    const matchesStatus = statusFilter === 'ALL' || nom.status === statusFilter;
    const matchesCategory = selectedCategoryFilter === 'ALL' || String(nom.categoryId) === selectedCategoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const columns = [
    {
      key: 'title',
      label: 'Nomination Dossier',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{val || 'Project Title'}</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Candidate ID: #{row.nomineeId} • Ref #{row.id}
          </span>
        </div>
      ),
    },
    {
      key: 'categoryName',
      label: 'Award Category',
      render: (val, row) => val || `Category #${row.categoryId}`,
    },
    {
      key: 'createdAt',
      label: 'Submitted On',
      render: (val) => formatDate(val),
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
          placeholder="Filter by title or candidate..."
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
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

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
      </div>

      <Card padding="none">
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="No nominations found in database"
          emptyDescription="There are no candidate nominations matching the selected filter in the database."
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
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CANDIDATE ID</span>
                <h3 style={{ margin: '0.2rem 0', fontSize: '1.25rem', fontWeight: 700 }}>
                  Nominee #{selectedNom.nomineeId}
                </h3>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Category: {selectedNom.categoryName}
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
                Description & Justification
              </h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {selectedNom.description || 'No description provided.'}
              </p>
            </div>

            {selectedNom.supportingDocument && (
              <div>
                <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.9rem', fontWeight: 600 }}>
                  Supporting Document Attachment
                </h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--accent-primary)' }}>
                  {selectedNom.supportingDocument}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
