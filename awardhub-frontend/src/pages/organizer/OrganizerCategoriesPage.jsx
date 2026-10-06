import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Award,
  CheckCircle,
  Calendar,
  FileText,
  Scale,
  Users,
  AlertCircle,
  Sparkles,
  Clock,
  ShieldCheck,
  Info,
  Trash,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesApi } from '../../api/categories';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

function addDays(baseDate, days) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function validateDates(f) {
  if (!f.nominationStartDate || !f.nominationEndDate || !f.votingStartDate || !f.votingEndDate || !f.resultPublicationDate) {
    return 'All timeline dates are required.';
  }
  const nomStart = new Date(f.nominationStartDate);
  const nomEnd = new Date(f.nominationEndDate);
  const voteStart = new Date(f.votingStartDate);
  const voteEnd = new Date(f.votingEndDate);
  const resultPub = new Date(f.resultPublicationDate);

  if (nomEnd <= nomStart) {
    return 'Nomination end date must be strictly after nomination start date.';
  }
  if (voteStart < nomEnd) {
    return 'Voting cannot begin before the nomination period concludes.';
  }
  if (voteEnd <= voteStart) {
    return 'Voting end date must be strictly after voting start date.';
  }
  if (resultPub < voteEnd) {
    return 'Result publication date must be after voting concludes.';
  }
  return null;
}

export default function OrganizerCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Judge panel management state
  const [availableJudges, setAvailableJudges] = useState([]);
  const [assignedJudges, setAssignedJudges] = useState([]);
  const [selectedJudgeId, setSelectedJudgeId] = useState('');
  const [assigningJudge, setAssigningJudge] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    status: 'ACTIVE',
    rules: '',
    nomineeEligibility: '',
    voterEligibility: '',
    nominationRequirements: '',
    nominationStartDate: '',
    nominationEndDate: '',
    votingStartDate: '',
    votingEndDate: '',
    resultPublicationDate: '',
    criteria: [],
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.list();
      let list = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (Array.isArray(res?.data?.content)) {
        list = res.data.content;
      } else if (Array.isArray(res?.content)) {
        list = res.content;
      }
      setCategories(list);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCat(null);
    setActiveTab('general');
    const today = getToday();
    setForm({
      name: '',
      code: '',
      description: '',
      status: 'ACTIVE',
      rules: 'All submissions must represent original work and include a working demonstration.',
      nomineeEligibility: 'Open to registered individual creators, tech teams, and organizations.',
      voterEligibility: 'Any registered AwardHub voter with an active, verified account.',
      nominationRequirements: '1. Executive summary deck or technical whitepaper (PDF)\n2. Working public demo URL or repository\n3. Verifiable performance or social impact metrics',
      nominationStartDate: today,
      nominationEndDate: addDays(today, 14),
      votingStartDate: addDays(today, 15),
      votingEndDate: addDays(today, 28),
      resultPublicationDate: addDays(today, 30),
      criteria: [
        {
          criterionName: 'Technical & Creative Innovation',
          description: 'Originality, novel architecture, and creative problem solving',
          weight: 40,
          maxScore: 100,
        },
        {
          criterionName: 'Execution & Reliability',
          description: 'Engineering excellence, code quality, and system resilience',
          weight: 35,
          maxScore: 100,
        },
        {
          criterionName: 'Impact & Community Value',
          description: 'Demonstrated adoption, real-world utility, and measurable outcomes',
          weight: 25,
          maxScore: 100,
        },
      ],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = async (cat) => {
    setEditingCat(cat);
    setActiveTab('general');
    const today = getToday();

    try {
      const details = await categoriesApi.getById(cat.id).catch(() => cat);
      const catData = details?.data || details || cat;

      setForm({
        name: catData.name || '',
        code: catData.code || '',
        description: catData.description || '',
        status: catData.status || 'ACTIVE',
        rules: catData.rules || '',
        nomineeEligibility: catData.nomineeEligibility || '',
        voterEligibility: catData.voterEligibility || '',
        nominationRequirements: catData.nominationRequirements || '',
        nominationStartDate: catData.nominationStartDate ? catData.nominationStartDate.split('T')[0] : today,
        nominationEndDate: catData.nominationEndDate ? catData.nominationEndDate.split('T')[0] : addDays(today, 14),
        votingStartDate: catData.votingStartDate ? catData.votingStartDate.split('T')[0] : addDays(today, 15),
        votingEndDate: catData.votingEndDate ? catData.votingEndDate.split('T')[0] : addDays(today, 28),
        resultPublicationDate: catData.resultPublicationDate ? catData.resultPublicationDate.split('T')[0] : addDays(today, 30),
        criteria: catData.criteria && catData.criteria.length > 0
          ? catData.criteria.map((c) => ({
              id: c.id,
              criterionName: c.criterionName || c.name || '',
              description: c.description || '',
              weight: Number(c.weight) || 0,
              maxScore: Number(c.maxScore) || 100,
            }))
          : [
              {
                criterionName: 'Overall Merit & Excellence',
                description: 'General evaluation criteria for this category',
                weight: 100,
                maxScore: 100,
              },
            ],
      });

      // Load assigned judges
      if (catData.assignedJudges) {
        setAssignedJudges(catData.assignedJudges);
      } else {
        const jList = await categoriesApi.getJudges(cat.id).catch(() => []);
        setAssignedJudges(Array.isArray(jList) ? jList : (jList?.data || []));
      }

      // Load available judges to assign
      const avail = await categoriesApi.getAvailableJudges().catch(() => []);
      setAvailableJudges(Array.isArray(avail) ? avail : (avail?.data || []));
    } catch (err) {
      console.error(err);
    }
    setModalOpen(true);
  };

  const handleAssignJudgeToCategory = async () => {
    if (!selectedJudgeId || !editingCat) return;
    setAssigningJudge(true);
    try {
      await categoriesApi.assignJudge(editingCat.id, { judgeId: Number(selectedJudgeId) });
      toast.success('Judge successfully assigned to category panel');
      setSelectedJudgeId('');
      const jList = await categoriesApi.getJudges(editingCat.id).catch(() => []);
      setAssignedJudges(Array.isArray(jList) ? jList : (jList?.data || []));
      const avail = await categoriesApi.getAvailableJudges().catch(() => []);
      setAvailableJudges(Array.isArray(avail) ? avail : (avail?.data || []));
    } catch (err) {
      toast.error(err.message || 'Failed to assign judge');
    } finally {
      setAssigningJudge(false);
    }
  };

  const handleRemoveJudgeFromCategory = async (judgeId) => {
    if (!editingCat) return;
    try {
      await categoriesApi.removeJudge(editingCat.id, judgeId);
      toast.success('Judge removed from category panel');
      const jList = await categoriesApi.getJudges(editingCat.id).catch(() => []);
      setAssignedJudges(Array.isArray(jList) ? jList : (jList?.data || []));
      const avail = await categoriesApi.getAvailableJudges().catch(() => []);
      setAvailableJudges(Array.isArray(avail) ? avail : (avail?.data || []));
    } catch (err) {
      toast.error(err.message || 'Failed to remove judge');
    }
  };

  const handleAddCriterion = () => {
    setForm({
      ...form,
      criteria: [
        ...form.criteria,
        {
          criterionName: '',
          description: '',
          weight: 0,
          maxScore: 100,
        },
      ],
    });
  };

  const handleRemoveCriterion = (index) => {
    if (form.criteria.length <= 1) {
      toast.error('At least one criterion is required');
      return;
    }
    const updated = form.criteria.filter((_, i) => i !== index);
    setForm({ ...form, criteria: updated });
  };

  const handleCriterionChange = (index, field, value) => {
    const updated = form.criteria.map((c, i) => (i === index ? { ...c, [field]: value } : c));
    setForm({ ...form, criteria: updated });
  };

  const handleAutoBalanceWeights = () => {
    const count = form.criteria.length;
    if (count === 0) return;
    const base = Math.floor((100 / count) * 100) / 100;
    const remainder = Number((100 - base * count).toFixed(2));
    const updated = form.criteria.map((c, i) => ({
      ...c,
      weight: i === 0 ? Number((base + remainder).toFixed(2)) : base,
    }));
    setForm({ ...form, criteria: updated });
    toast.success('Weights auto-balanced to 100%');
  };

  const applyTimelinePreset = (type) => {
    const today = getToday();
    if (type === 'standard') {
      setForm({
        ...form,
        nominationStartDate: today,
        nominationEndDate: addDays(today, 14),
        votingStartDate: addDays(today, 15),
        votingEndDate: addDays(today, 28),
        resultPublicationDate: addDays(today, 30),
      });
      toast.success('Applied Standard 30-Day Cycle');
    } else if (type === 'fast') {
      setForm({
        ...form,
        nominationStartDate: today,
        nominationEndDate: addDays(today, 5),
        votingStartDate: addDays(today, 6),
        votingEndDate: addDays(today, 12),
        resultPublicationDate: addDays(today, 14),
      });
      toast.success('Applied Fast-Track 14-Day Cycle');
    } else if (type === 'extended') {
      setForm({
        ...form,
        nominationStartDate: today,
        nominationEndDate: addDays(today, 30),
        votingStartDate: addDays(today, 31),
        votingEndDate: addDays(today, 55),
        resultPublicationDate: addDays(today, 60),
      });
      toast.success('Applied Extended 60-Day Cycle');
    }
  };

  const applyRequirementTemplate = (type) => {
    if (type === 'tech') {
      setForm({
        ...form,
        nomineeEligibility: 'Open to individual engineers, open-source maintainers, AI developers, and tech startups.',
        voterEligibility: 'Any registered AwardHub voter with an active, verified account.',
        nominationRequirements: '1. Architecture deck or technical whitepaper (PDF)\n2. Working public demo URL or repository\n3. Benchmark performance metrics or system telemetry',
      });
      toast.success('Applied Tech & Engineering template');
    } else if (type === 'creative') {
      setForm({
        ...form,
        nomineeEligibility: 'Creative directors, UI/UX design teams, visual artists, and digital media studios.',
        voterEligibility: 'Verified public voters.',
        nominationRequirements: '1. Portfolio dossier or case study PDF\n2. High-resolution imagery or interactive prototype link\n3. 2-minute video presentation / walkthrough',
      });
      toast.success('Applied Creative Design template');
    } else if (type === 'research') {
      setForm({
        ...form,
        nomineeEligibility: 'Academic researchers, university labs, postdocs, and institutional R&D scientists.',
        voterEligibility: 'Accredited peer reviewers and verified voters.',
        nominationRequirements: '1. Peer-reviewed paper manuscript or preprint PDF\n2. Dataset / code reproducibility documentation\n3. Institutional endorsement or patent reference',
      });
      toast.success('Applied Academic Research template');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Category Name is required');
      setActiveTab('general');
      return;
    }

    const dateErr = validateDates(form);
    if (dateErr) {
      toast.error(dateErr);
      setActiveTab('timeline');
      return;
    }

    if (!form.criteria || form.criteria.length === 0) {
      toast.error('At least one judging criterion is required');
      setActiveTab('rubric');
      return;
    }

    const totalWeight = form.criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      toast.error(`Total criterion weight must equal 100% (currently ${totalWeight.toFixed(1)}%)`);
      setActiveTab('rubric');
      return;
    }

    for (let i = 0; i < form.criteria.length; i++) {
      const c = form.criteria[i];
      if (!c.criterionName || !c.criterionName.trim()) {
        toast.error(`Criterion #${i + 1} requires a title`);
        setActiveTab('rubric');
        return;
      }
      if (!c.weight || Number(c.weight) <= 0) {
        toast.error(`Criterion #${i + 1} weight must be greater than 0%`);
        setActiveTab('rubric');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        awardEventId: editingCat?.awardEventId || 1,
        name: form.name.trim(),
        code: form.code ? form.code.trim().toUpperCase() : undefined,
        description: form.description?.trim() || form.name.trim(),
        rules: form.rules?.trim() || undefined,
        nomineeEligibility: form.nomineeEligibility?.trim() || undefined,
        voterEligibility: form.voterEligibility?.trim() || undefined,
        nominationRequirements: form.nominationRequirements?.trim() || undefined,
        status: form.status || 'ACTIVE',
        nominationStartDate: `${form.nominationStartDate}T09:00:00`,
        nominationEndDate: `${form.nominationEndDate}T23:59:59`,
        votingStartDate: `${form.votingStartDate}T09:00:00`,
        votingEndDate: `${form.votingEndDate}T23:59:59`,
        resultPublicationDate: `${form.resultPublicationDate}T18:00:00`,
        criteria: form.criteria.map((c) => ({
          criterionName: c.criterionName.trim(),
          description: c.description?.trim() || c.criterionName.trim(),
          weight: Number(c.weight),
          maxScore: Number(c.maxScore) || 100,
        })),
      };

      if (editingCat) {
        await categoriesApi.update(editingCat.id, payload);
        toast.success('Category updated successfully');
      } else {
        await categoriesApi.create(payload);
        toast.success('Category created successfully with full timeline & rubric');
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await categoriesApi.delete(deleteTarget.id);
      toast.success('Category deleted');
      setDeleteTarget(null);
      loadCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  const totalCriterionWeight = form.criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  const isWeightValid = Math.abs(totalCriterionWeight - 100) < 0.01;
  const dateError = validateDates(form);

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (val, row) => (
        <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '0.8125rem' }}>
          {val || `CAT-${row.id}`}
        </span>
      ),
      width: '90px',
    },
    {
      key: 'name',
      label: 'Category Name & Overview',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{val}</span>
          <span
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              maxWidth: 340,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginTop: '0.15rem',
            }}
          >
            {row.description}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val || 'ACTIVE'} />,
      width: '120px',
    },
    {
      key: 'nominationEndDate',
      label: 'Nomination Window',
      render: (val, row) => (
        <div style={{ fontSize: '0.8125rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Close: </span>
          <span style={{ fontWeight: 600 }}>{formatDate(val)}</span>
        </div>
      ),
      width: '160px',
    },
    {
      key: 'votingEndDate',
      label: 'Voting Deadline',
      render: (val) => (
        <div style={{ fontSize: '0.8125rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Close: </span>
          <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{formatDate(val)}</span>
        </div>
      ),
      width: '160px',
    },
    {
      key: 'criteriaCount',
      label: 'Rubric Criteria',
      render: (val, row) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          {val || (row.criteria ? row.criteria.length : 1)} Criteria
        </span>
      ),
      width: '120px',
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button size="sm" variant="ghost" icon={Edit2} onClick={() => handleOpenEdit(row)}>
            Configure
          </Button>
          <Button size="sm" variant="outline" icon={Trash2} onClick={() => setDeleteTarget(row)}>
            Delete
          </Button>
        </div>
      ),
      width: '180px',
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Award Categories Management</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Configure award titles, nomination dates, voting windows, supporting documents, and judging rubrics
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
          Create Category
        </Button>
      </div>

      <Card padding="none">
        <DataTable
          columns={columns}
          data={categories}
          loading={loading}
          emptyMessage="No award categories defined"
          emptyDescription="Click 'Create Category' to set up your first award tier with complete timelines and rubrics."
        />
      </Card>

      {/* Comprehensive Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        size="studio"
        title={editingCat ? `Configure Category: ${form.name || editingCat.name}` : 'Create New Award Category'}
        subtitle="Enterprise configuration studio: multi-phase schedules, nomination requirements, judging rubrics, and judge assignments"
        headerContent={
          <div
            style={{
              display: 'flex',
              gap: '0.65rem',
              flexWrap: 'wrap',
            }}
          >
            {[
              { id: 'general', label: '1. General & Rules', icon: FileText },
              { id: 'timeline', label: '2. Phased Schedule', icon: Calendar },
              { id: 'requirements', label: '3. Eligibility & Documents', icon: ShieldCheck },
              { id: 'rubric', label: '4. Judging Rubric', icon: Scale },
              ...(editingCat ? [{ id: 'judges', label: '5. Judge Panel', icon: Users }] : []),
            ].map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: active ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: active ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: active ? 600 : 500,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon size={15} />
                  {t.label}
                </button>
              );
            })}
          </div>
        }
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
              {isWeightValid ? (
                <span style={{ color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                  <CheckCircle size={16} /> Rubric Total: 100% Balanced
                </span>
              ) : (
                <span style={{ color: 'var(--status-warning)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                  <AlertCircle size={16} /> Rubric Total: {totalCriterionWeight.toFixed(1)}% (Must equal 100%)
                </span>
              )}
              {dateError && (
                <span style={{ color: 'var(--status-error)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500 }}>
                  <AlertCircle size={16} /> Timeline warning: {dateError}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} loading={saving}>
                {editingCat ? 'Save Changes' : 'Create Category'}
              </Button>
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
          {/* Tab 1: General & Rules */}
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Breakthrough AI Innovation of the Year"
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
                    Code Identifier
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="AI-INNOV-26"
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
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Category Summary & Scope
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed description of the award category, its vision, and what achievements are recognized..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Lifecycle Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
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
                    <option value="ACTIVE">ACTIVE (Published & Open for Phase)</option>
                    <option value="DRAFT">DRAFT (Unpublished / Preparing)</option>
                    <option value="VOTING_OPEN">VOTING_OPEN (Ballots Live)</option>
                    <option value="VOTING_CLOSED">VOTING_CLOSED (Deliberation)</option>
                    <option value="CLOSED">CLOSED (Evaluation Finished)</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Competition Rules & Guidelines
                  </label>
                  <input
                    type="text"
                    value={form.rules}
                    onChange={(e) => setForm({ ...form, rules: e.target.value })}
                    placeholder="e.g. Standard AwardHub fair competition & anti-bribery policies apply."
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
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Phased Timeline */}
          {activeTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-tertiary)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Timeline Quick Presets:</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button size="sm" variant="ghost" onClick={() => applyTimelinePreset('fast')}>
                    Fast (14 Days)
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => applyTimelinePreset('standard')}>
                    Standard (30 Days)
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => applyTimelinePreset('extended')}>
                    Gala (60 Days)
                  </Button>
                </div>
              </div>

              {dateError && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--status-error)',
                    color: 'var(--status-error)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{dateError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div
                  style={{
                    background: 'var(--bg-tertiary)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={15} style={{ color: 'var(--accent-primary)' }} />
                    Phase 1: Nomination Window
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        Nomination Opens On *
                      </label>
                      <input
                        type="date"
                        value={form.nominationStartDate}
                        onChange={(e) => setForm({ ...form, nominationStartDate: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          fontSize: '0.8125rem',
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        Nomination Closes On (Submission Deadline) *
                      </label>
                      <input
                        type="date"
                        value={form.nominationEndDate}
                        onChange={(e) => setForm({ ...form, nominationEndDate: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          fontSize: '0.8125rem',
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--bg-tertiary)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={15} style={{ color: 'var(--status-info)' }} />
                    Phase 2: Public Voting & Panel Window
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        Voting Commences On *
                      </label>
                      <input
                        type="date"
                        value={form.votingStartDate}
                        onChange={(e) => setForm({ ...form, votingStartDate: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          fontSize: '0.8125rem',
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        Voting Closes On (Ballot Cutoff) *
                      </label>
                      <input
                        type="date"
                        value={form.votingEndDate}
                        onChange={(e) => setForm({ ...form, votingEndDate: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          fontSize: '0.8125rem',
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Award size={15} style={{ color: 'var(--status-warning)' }} />
                      Phase 3: Official Result Publication
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Date when the leaderboard and winners become publicly visible to voters & participants.
                    </span>
                  </div>
                  <div>
                    <input
                      type="date"
                      value={form.resultPublicationDate}
                      onChange={(e) => setForm({ ...form, resultPublicationDate: e.target.value })}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8125rem',
                      }}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Eligibility & Supporting Documents */}
          {activeTab === 'requirements' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-tertiary)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Insert Requirement Template:</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button size="sm" variant="ghost" onClick={() => applyRequirementTemplate('tech')}>
                    Tech & AI
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => applyRequirementTemplate('creative')}>
                    Creative Design
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => applyRequirementTemplate('research')}>
                    R&D / Science
                  </Button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Nominee Eligibility Criteria
                </label>
                <textarea
                  rows={2}
                  value={form.nomineeEligibility}
                  onChange={(e) => setForm({ ...form, nomineeEligibility: e.target.value })}
                  placeholder="Specify who qualifies to submit a nomination (e.g. registered companies, academic researchers, open-source projects)..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Voter Eligibility & Verification
                </label>
                <textarea
                  rows={2}
                  value={form.voterEligibility}
                  onChange={(e) => setForm({ ...form, voterEligibility: e.target.value })}
                  placeholder="Who is authorized to vote (e.g. verified AwardHub voters with valid NIC, accredited panel members)..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Nomination Requirements & Mandatory Supporting Documents
                </label>
                <textarea
                  rows={4}
                  value={form.nominationRequirements}
                  onChange={(e) => setForm({ ...form, nominationRequirements: e.target.value })}
                  placeholder="List the mandatory materials candidates must provide (e.g. PDF deck, demo video, verified benchmark report, recommendation letter)..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          )}

          {/* Tab 4: Judging Rubric */}
          {activeTab === 'rubric' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-tertiary)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Scale size={16} style={{ color: isWeightValid ? 'var(--status-success)' : 'var(--status-warning)' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      Total Rubric Weight:{' '}
                      <span style={{ color: isWeightValid ? 'var(--status-success)' : 'var(--status-warning)' }}>
                        {totalCriterionWeight.toFixed(1)}% / 100%
                      </span>
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    All criteria weights must add up to precisely 100.00% for judge scoring.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button size="sm" variant="outline" onClick={handleAutoBalanceWeights}>
                    Auto-Balance to 100%
                  </Button>
                  <Button size="sm" variant="primary" icon={Plus} onClick={handleAddCriterion}>
                    Add Criterion
                  </Button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '340px', overflowY: 'auto' }}>
                {form.criteria.map((cr, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--accent-primary)' }}>
                        Criterion #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCriterion(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.2rem',
                        }}
                        title="Delete criterion"
                      >
                        <Trash size={15} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <input
                          type="text"
                          value={cr.criterionName}
                          onChange={(e) => handleCriterionChange(idx, 'criterionName', e.target.value)}
                          placeholder="e.g. Technical Feasibility"
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-input)',
                            color: 'var(--text-primary)',
                            fontSize: '0.8125rem',
                          }}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="100"
                          value={cr.weight}
                          onChange={(e) => handleCriterionChange(idx, 'weight', e.target.value)}
                          placeholder="Weight %"
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-input)',
                            color: 'var(--text-primary)',
                            fontSize: '0.8125rem',
                          }}
                          required
                        />
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>%</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input
                          type="number"
                          min="10"
                          max="1000"
                          value={cr.maxScore}
                          onChange={(e) => handleCriterionChange(idx, 'maxScore', e.target.value)}
                          placeholder="Max Score"
                          style={{
                            width: '100%',
                            padding: '0.45rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-input)',
                            color: 'var(--text-primary)',
                            fontSize: '0.8125rem',
                          }}
                          required
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>pts</span>
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={cr.description}
                        onChange={(e) => handleCriterionChange(idx, 'description', e.target.value)}
                        placeholder="Guidance notes for judges evaluating this criterion..."
                        style={{
                          width: '100%',
                          padding: '0.45rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          fontSize: '0.75rem',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Judge Panel (Only shown in edit mode) */}
          {activeTab === 'judges' && editingCat && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Assign Accredited Judge to Panel
                  </label>
                  <select
                    value={selectedJudgeId}
                    onChange={(e) => setSelectedJudgeId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <option value="">Select a registered judge...</option>
                    {availableJudges.map((j) => (
                      <option key={j.id || j.judgeId} value={j.id || j.judgeId}>
                        {j.fullName || j.username || j.email} ({j.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ alignSelf: 'flex-end' }}>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleAssignJudgeToCategory}
                    loading={assigningJudge}
                    disabled={!selectedJudgeId}
                  >
                    Assign Judge
                  </Button>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>
                  Currently Assigned Panel ({assignedJudges.length} Judges)
                </h4>
                {assignedJudges.length === 0 ? (
                  <div
                    style={{
                      padding: '1.5rem',
                      textAlign: 'center',
                      background: 'var(--bg-card)',
                      border: '1px dashed var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-muted)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    No judges currently assigned to this category. Select a judge above to add them to the evaluation panel.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {assignedJudges.map((j) => (
                      <div
                        key={j.id || j.judgeId}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block' }}>
                            {j.fullName || j.username || `Judge #${j.id || j.judgeId}`}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{j.email || 'Panel Evaluator'}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveJudgeFromCategory(j.id || j.judgeId)}
                          style={{ color: 'var(--status-error)' }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Award Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? All associated nomination mappings will be removed.`}
        confirmText="Delete Category"
        variant="danger"
      />
    </div>
  );
}
