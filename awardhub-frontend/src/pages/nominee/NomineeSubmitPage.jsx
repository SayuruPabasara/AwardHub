import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Layers,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  Link as LinkIcon,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesApi } from '../../api/categories';
import { nominationsApi } from '../../api/nominations';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { unwrapList } from '../../utils/reportHelpers';
import { formatDateTime } from '../../utils/formatters';

const TITLE_MAX = 150;

export default function NomineeSubmitPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const [form, setForm] = useState({
    categoryId: '',
    title: '',
    description: '',
    supportingDocument: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingCats(true);
    try {
      // Try dedicated nominee endpoint first; fall back to listPublic
      let list = [];
      try {
        const res = await categoriesApi.forNominee();
        list = unwrapList(res);
      } catch (e) {
        const res = await categoriesApi.listPublic();
        list = unwrapList(res);
      }

      setCategories(list);
      if (list.length > 0) {
        // Select first open category or first available
        const firstOpen = list.find((c) => c.nominationOpen !== false) || list[0];
        setForm((prev) => ({ ...prev, categoryId: firstOpen.id }));
      }
    } catch (err) {
      toast.error('Failed to load award categories');
      setCategories([]);
    } finally {
      setLoadingCats(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.categoryId) {
      toast.error('Please select an award category');
      setCurrentStep(1);
      return false;
    }
    if (!form.title.trim()) {
      toast.error('Nomination title is required');
      setCurrentStep(2);
      return false;
    }
    if (form.title.length > TITLE_MAX) {
      toast.error(`Title must not exceed ${TITLE_MAX} characters`);
      setCurrentStep(2);
      return false;
    }
    if (!form.description.trim()) {
      toast.error('Nomination description is required');
      setCurrentStep(2);
      return false;
    }
    return true;
  };

  /* Action 1: Save as DRAFT */
  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    setSavingDraft(true);
    try {
      await nominationsApi.create({
        categoryId: Number(form.categoryId),
        title: form.title.trim(),
        description: form.description.trim(),
        supportingDocument: form.supportingDocument.trim() || null,
      });
      toast.success('Nomination saved as Draft! You can edit and submit it later.');
      navigate('/nominee/nominations');
    } catch (err) {
      toast.error(err.message || 'Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  /* Action 2: Create DRAFT and immediately SUBMIT for Review */
  const handleSubmitFinal = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // 1. Create draft nomination
      const created = await nominationsApi.create({
        categoryId: Number(form.categoryId),
        title: form.title.trim(),
        description: form.description.trim(),
        supportingDocument: form.supportingDocument.trim() || null,
      });

      const nomId = created?.id || created?.data?.id;
      if (!nomId) {
        throw new Error('Created nomination ID was not returned');
      }

      // 2. Submit draft for official review
      await nominationsApi.submit(nomId);
      toast.success('Nomination officially submitted for committee review!');
      navigate('/nominee/nominations');
    } catch (err) {
      toast.error(err.message || 'Failed to submit nomination');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCats) {
    return <LoadingSpinner message="Loading award categories..." />;
  }

  const selectedCategory = categories.find((c) => String(c.id) === String(form.categoryId));

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/nominee/nominations')}>
          Back to Nominations
        </Button>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
            Submit Award Nomination
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Complete the nomination application to enter into competition
          </p>
        </div>
      </div>

      {/* Stepper Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative',
          padding: '0 1rem',
        }}
      >
        {[
          { step: 1, label: 'Select Category', icon: Layers },
          { step: 2, label: 'Nomination Dossier', icon: FileText },
          { step: 3, label: 'Review & Confirm', icon: CheckCircle },
        ].map((item) => {
          const isDone = currentStep > item.step;
          const isCurrent = currentStep === item.step;
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: isCurrent ? 'var(--accent-primary)' : isDone ? 'var(--status-success)' : 'var(--bg-card)',
                  color: isCurrent || isDone ? 'var(--text-on-accent)' : 'var(--text-muted)',
                  border: isCurrent
                    ? '2px solid var(--accent-gold)'
                    : isDone
                    ? '2px solid var(--status-success)'
                    : '2px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  boxShadow: isCurrent ? '0 0 0 3px var(--accent-gold-soft), var(--shadow-sm)' : 'none',
                }}
              >
                <Icon size={18} />
              </div>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: isCurrent ? 600 : 500,
                  color: isCurrent ? 'var(--text-primary)' : isDone ? 'var(--text-secondary)' : 'var(--text-muted)',
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Category Selection */}
      {currentStep === 1 && (
        <Card title="Step 1: Choose Award Category" subtitle="Select an active award category accepting candidate submissions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {categories.length === 0 ? (
              <div
                style={{
                  padding: '2.5rem 1rem',
                  textAlign: 'center',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)',
                }}
              >
                <AlertCircle size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--status-warning)' }} />
                <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>No active categories available</h4>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                  There are currently no active categories open for nominations. Please check back when nomination windows open.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1rem',
                }}
              >
                {categories.map((cat) => {
                  const isSelected = String(cat.id) === String(form.categoryId);
                  const isClosed = cat.nominationOpen === false;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => !isClosed && setForm({ ...form, categoryId: cat.id })}
                      style={{
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected
                          ? '2px solid var(--accent-primary)'
                          : isClosed
                          ? '1px dashed var(--border-color-strong)'
                          : '1px solid var(--border-color)',
                        background: isSelected
                          ? 'var(--accent-soft)'
                          : isClosed
                          ? 'var(--bg-tertiary)'
                          : 'var(--bg-card)',
                        cursor: isClosed ? 'not-allowed' : 'pointer',
                        transition: 'all var(--transition-fast)',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              letterSpacing: '0.03em',
                              color: 'var(--accent-gold-text)',
                            }}
                          >
                            {cat.code || `CAT #${cat.id}`}
                          </span>
                          <StatusBadge status={isClosed ? 'CLOSED' : 'ACTIVE'} label={isClosed ? 'Closed' : 'Open'} size="sm" />
                        </div>
                        <h4 style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '1rem', fontWeight: 600 }}>
                          {cat.name}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          {cat.description || 'Award category open for nominations.'}
                        </p>
                      </div>

                      {cat.nominationEndDate && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <Calendar size={13} style={{ color: 'var(--accent-gold-text)' }} />
                          <span>Deadline: {formatDateTime(cat.nominationEndDate)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedCategory && (
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h5 style={{ margin: 0, fontWeight: 700, color: 'var(--accent-primary)', fontSize: '0.9rem' }}>
                    📋 Requirements for {selectedCategory.name}
                  </h5>
                  {selectedCategory.nominationEndDate && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Deadline: {formatDateTime(selectedCategory.nominationEndDate)}
                    </span>
                  )}
                </div>
                {selectedCategory.nomineeEligibility && (
                  <div style={{ fontSize: '0.8125rem' }}>
                    <strong>Eligibility:</strong> {selectedCategory.nomineeEligibility}
                  </div>
                )}
                {selectedCategory.nominationRequirements && (
                  <div style={{ fontSize: '0.8125rem' }}>
                    <strong>Required Documentation:</strong> {selectedCategory.nominationRequirements}
                  </div>
                )}
                {selectedCategory.rules && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <strong>Rules:</strong> {selectedCategory.rules}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
                disabled={!selectedCategory || selectedCategory.nominationOpen === false}
                onClick={() => setCurrentStep(2)}
              >
                Next: Dossier Details
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Nomination Dossier */}
      {currentStep === 2 && (
        <Card title="Step 2: Nomination Dossier" subtitle="Provide the title, achievements, and supporting documentation for your submission">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                  Nomination / Project Title *
                </label>
                <span style={{ fontSize: '0.75rem', color: form.title.length > TITLE_MAX ? 'var(--status-error)' : 'var(--text-muted)' }}>
                  {form.title.length}/{TITLE_MAX}
                </span>
              </div>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. NeuralFlow: Low-Latency Edge LLM Inference Engine"
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Comprehensive Description & Justification *
              </label>
              <textarea
                name="description"
                rows={6}
                value={form.description}
                onChange={handleChange}
                placeholder="Detail the candidate's breakthrough achievements, quantifiable benchmarks, innovation scope, and justification for this award..."
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
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                }}
                required
              />
              <span style={{ display: 'block', marginTop: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Include measurable milestones, adoption statistics, patent details, and compliance verifications.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Supporting Document / Verification URL
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="url"
                  name="supportingDocument"
                  value={form.supportingDocument}
                  onChange={handleChange}
                  placeholder="https://example.com/whitepaper-or-architecture.pdf"
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <span style={{ display: 'block', marginTop: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Optional. Link to a technical whitepaper, public GitHub repository, verification deck, or demo video.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <Button variant="secondary" onClick={() => setCurrentStep(1)}>
                Previous: Category
              </Button>
              <Button
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => {
                  if (!form.title.trim()) {
                    toast.error('Nomination title is required');
                    return;
                  }
                  if (!form.description.trim()) {
                    toast.error('Description is required');
                    return;
                  }
                  setCurrentStep(3);
                }}
              >
                Next: Review Submission
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Review & Submit */}
      {currentStep === 3 && (
        <Card title="Step 3: Verification & Official Submission" subtitle="Review your dossier before saving as a draft or officially submitting for judging">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                background: 'var(--bg-tertiary)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                border: '1px solid var(--border-color)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Target Award Category
                </span>
                <p style={{ margin: '0.15rem 0 0 0', fontWeight: 600, fontSize: '1rem' }}>
                  {selectedCategory?.name}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Nomination / Project Title
                </span>
                <p style={{ margin: '0.15rem 0 0 0', fontWeight: 600, fontSize: '1.05rem', color: 'var(--accent-primary)' }}>
                  {form.title}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Description & Justification
                </span>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {form.description}
                </p>
              </div>

              {form.supportingDocument && (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Supporting Document
                  </span>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.875rem' }}>
                    <a
                      href={form.supportingDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--accent-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <LinkIcon size={14} /> {form.supportingDocument}
                    </a>
                  </p>
                </div>
              )}
            </div>

            <div
              style={{
                padding: '0.9rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-info-soft)',
                border: '1px solid var(--status-info)',
                fontSize: '0.8125rem',
                color: 'var(--text-primary)',
                lineHeight: 1.5,
              }}
            >
              💡 <strong>Submission note:</strong> Saving as a draft allows you to edit or withdraw your nomination later. Once officially submitted for review, the dossier is locked and queued for organizer inspection.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <Button variant="secondary" onClick={() => setCurrentStep(2)}>
                Edit Details
              </Button>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button
                  variant="outline"
                  icon={Save}
                  loading={savingDraft}
                  disabled={submitting}
                  onClick={handleSaveDraft}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="primary"
                  icon={Send}
                  loading={submitting}
                  disabled={savingDraft}
                  onClick={handleSubmitFinal}
                >
                  Submit for Review
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
