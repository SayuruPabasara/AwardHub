import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesApi } from '../../api/categories';
import { evaluationApi } from '../../api/evaluation';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function OrganizerJudgesPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ judgeId: '', role: 'JUDGE' });
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCatId) {
      loadJudges(selectedCatId);
    }
  }, [selectedCatId]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.list();
      const list = Array.isArray(data) ? data : [];
      setCategories(list);
      if (list.length > 0) {
        setSelectedCatId(list[0].id);
      }
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadJudges = async (catId) => {
    try {
      const data = await categoriesApi.getJudges(catId).catch(() => evaluationApi.assignmentsByCategory(catId));
      setJudges(Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []));
    } catch (err) {
      setJudges([]);
    }
  };

  const handleAssignJudge = async (e) => {
    e.preventDefault();
    if (!assignForm.judgeId) {
      toast.error('Please enter a Judge User ID');
      return;
    }
    setAssigning(true);
    try {
      await categoriesApi.assignJudge(selectedCatId, {
        judgeId: Number(assignForm.judgeId),
      });
      toast.success('Judge successfully assigned to category panel');
      setAssignModalOpen(false);
      setAssignForm({ judgeId: '', role: 'JUDGE' });
      loadJudges(selectedCatId);
    } catch (err) {
      toast.error(err.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const columns = [
    {
      key: 'username',
      label: 'Judge Account',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{val || `Judge #${row.id || row.judgeId}`}</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {row.email || 'Panel Reviewer'}
          </span>
        </div>
      ),
    },
    {
      key: 'assignedNoms',
      label: 'Assigned Worklist',
      render: (val, row) => `${val || row.assignedCount || 0} Dossiers`,
    },
    {
      key: 'status',
      label: 'Panel Status',
      render: (val) => (
        <span
          style={{
            color: 'var(--status-success)',
            fontWeight: 600,
            fontSize: '0.8125rem',
          }}
        >
          {val || 'Active Panelist'}
        </span>
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
            Evaluation Panel Assignments
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Inspect and assign judges to category panels from the MS SQL database
          </p>
        </div>
        <Button variant="primary" icon={UserPlus} onClick={() => setAssignModalOpen(true)}>
          Assign Judge to Panel
        </Button>
      </div>

      {/* Category selector */}
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {categories.map((cat) => {
          const isSelected = cat.id === selectedCatId;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                border: isSelected
                  ? '1px solid var(--accent-primary)'
                  : '1px solid var(--border-color)',
                background: isSelected ? 'var(--accent-soft)' : 'var(--bg-card)',
                color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Award size={16} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      <Card padding="none">
        <DataTable
          columns={columns}
          data={judges}
          loading={loading}
          emptyMessage="No judges assigned to this category"
          emptyDescription="Assign a judge using the button above to allocate this category to their evaluation panel."
        />
      </Card>

      {/* Assign Judge Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Judge to Category"
        subtitle="Add an accredited reviewer to this award category panel"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAssignJudge} loading={assigning}>
              Assign to Panel
            </Button>
          </>
        }
      >
        <form onSubmit={handleAssignJudge} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Judge User ID *
            </label>
            <input
              type="number"
              value={assignForm.judgeId}
              onChange={(e) => setAssignForm({ ...assignForm, judgeId: e.target.value })}
              placeholder="e.g. 3"
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Panel Role
            </label>
            <select
              value={assignForm.role}
              onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value })}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            >
              <option value="JUDGE">Lead Reviewer / Judge</option>
              <option value="PEER_REVIEWER">Peer Reviewer</option>
              <option value="CHAIR">Panel Chairperson</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
