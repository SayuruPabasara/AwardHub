import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Award, Trash2, CheckCircle, Shield, AlertCircle } from 'lucide-react';
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

  // Available registered judges for dropdown
  const [availableJudges, setAvailableJudges] = useState([]);
  const [loadingAvailableJudges, setLoadingAvailableJudges] = useState(false);

  // Assignment modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ judgeId: '', role: 'JUDGE' });
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadCategories();
    loadAvailableJudges();
  }, []);

  useEffect(() => {
    if (selectedCatId) {
      loadJudges(selectedCatId);
    } else {
      setJudges([]);
    }
  }, [selectedCatId]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.list();
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data?.content)) {
        list = data.data.content;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.content)) {
        list = data.content;
      }
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

  const loadAvailableJudges = async () => {
    setLoadingAvailableJudges(true);
    try {
      const res = await categoriesApi.getAvailableJudges();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setAvailableJudges(list);
    } catch (err) {
      console.warn('Failed to load registered judges:', err);
      setAvailableJudges([]);
    } finally {
      setLoadingAvailableJudges(false);
    }
  };

  const loadJudges = async (catId) => {
    if (!catId) return;
    try {
      const data = await categoriesApi.getJudges(catId).catch(() => evaluationApi.assignmentsByCategory(catId));
      setJudges(Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []));
    } catch (err) {
      setJudges([]);
    }
  };

  const handleOpenAssignModal = () => {
    setAssignForm({ judgeId: '', role: 'JUDGE' });
    setAssignModalOpen(true);
    loadAvailableJudges();
  };

  const handleAssignJudge = async (e) => {
    e.preventDefault();
    const effectiveCatId = selectedCatId || (categories.length > 0 ? categories[0].id : null);
    if (!effectiveCatId) {
      toast.error('Please select an award category first');
      return;
    }
    if (!assignForm.judgeId) {
      toast.error('Please select an accredited judge from the list');
      return;
    }
    setAssigning(true);
    try {
      await categoriesApi.assignJudge(effectiveCatId, {
        judgeId: Number(assignForm.judgeId),
      });
      toast.success('Judge successfully assigned to category panel');
      setAssignModalOpen(false);
      setAssignForm({ judgeId: '', role: 'JUDGE' });
      loadJudges(effectiveCatId);
    } catch (err) {
      const msg = err.response?.data?.message || err.data?.message || err.message || 'Assignment failed';
      toast.error(msg);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveJudge = async (judgeId) => {
    if (!selectedCatId) return;
    if (!window.confirm('Are you sure you want to remove this judge from the category panel?')) return;
    try {
      await categoriesApi.removeJudge(selectedCatId, judgeId);
      toast.success('Judge removed from category panel');
      loadJudges(selectedCatId);
    } catch (err) {
      toast.error(err.message || 'Failed to remove judge');
    }
  };

  const selectedJudgeInfo = availableJudges.find((j) => String(j.id) === String(assignForm.judgeId));

  const columns = [
    {
      key: 'fullName',
      label: 'Judge Account',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{row.fullName || row.username || `Judge #${row.judgeId || row.id}`}</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {row.email || 'Panel Reviewer'}
          </span>
        </div>
      ),
    },
    {
      key: 'assignedAt',
      label: 'Assigned Date',
      render: (val) => (val ? new Date(val).toLocaleDateString() : 'Active'),
    },
    {
      key: 'assignedBy',
      label: 'Assigned By',
      render: (val) => val || 'Award Organizer',
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
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <CheckCircle size={14} /> {val || 'Active Panelist'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <Button
          size="sm"
          variant="ghost"
          icon={Trash2}
          style={{ color: 'var(--status-error)' }}
          onClick={() => handleRemoveJudge(row.judgeId || row.id)}
          title="Remove judge from category panel"
        >
          Remove
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={26} color="var(--accent-primary)" />
            Evaluation Panel Assignments
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Inspect and assign registered expert judges to category evaluation panels
          </p>
        </div>
        <Button
          variant="primary"
          icon={UserPlus}
          onClick={handleOpenAssignModal}
          disabled={categories.length === 0}
        >
          Assign Judge to Panel
        </Button>
      </div>

      {/* Category selector */}
      {categories.length > 0 ? (
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
      ) : !loading ? (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--status-warning-soft)',
            border: '1px solid color-mix(in srgb, var(--status-warning) 30%, transparent)',
            color: 'var(--status-warning)',
            fontSize: '0.875rem',
          }}
        >
          No award categories found. Please create an award category first before configuring evaluation panels.
        </div>
      ) : null}

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
        subtitle="Select an accredited reviewer from registered judges to add to this panel"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAssignJudge}
              loading={assigning}
              disabled={!assignForm.judgeId || !selectedCatId}
            >
              Assign to Panel
            </Button>
          </>
        }
      >
        <form onSubmit={handleAssignJudge} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Target Award Category */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Target Award Category *
            </label>
            <select
              value={selectedCatId || ''}
              onChange={(e) => setSelectedCatId(Number(e.target.value))}
              required
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
              <option value="">-- Choose an award category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.status})
                </option>
              ))}
            </select>
          </div>

          {/* Select Judge from Registered Judges */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Select Accredited Judge *
            </label>
            {loadingAvailableJudges ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                Loading registered judges...
              </div>
            ) : availableJudges.length > 0 ? (
              <select
                value={assignForm.judgeId}
                onChange={(e) => setAssignForm({ ...assignForm, judgeId: e.target.value })}
                required
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
                <option value="">-- Select an accredited judge --</option>
                {availableJudges.map((judge) => {
                  const isAlreadyAssigned = judges.some(
                    (j) => String(j.judgeId || j.id) === String(judge.id)
                  );
                  return (
                    <option
                      key={judge.id}
                      value={judge.id}
                      disabled={isAlreadyAssigned}
                    >
                      {judge.fullName} ({judge.email}) {isAlreadyAssigned ? '— [Already Assigned]' : ''}
                    </option>
                  );
                })}
              </select>
            ) : (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--status-error-soft)',
                  border: '1px solid color-mix(in srgb, var(--status-error) 30%, transparent)',
                  fontSize: '0.825rem',
                  color: 'var(--status-error)',
                }}
              >
                No registered users with JUDGE role found in the database. Ensure judge accounts are registered.
              </div>
            )}
          </div>

          {/* Selected Judge Preview Card */}
          {selectedJudgeInfo && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'var(--accent-primary)',
                  color: 'var(--text-on-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                {selectedJudgeInfo.fullName ? selectedJudgeInfo.fullName.charAt(0).toUpperCase() : 'J'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedJudgeInfo.fullName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {selectedJudgeInfo.email} • User ID: #{selectedJudgeInfo.id}
                </div>
              </div>
            </div>
          )}

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
