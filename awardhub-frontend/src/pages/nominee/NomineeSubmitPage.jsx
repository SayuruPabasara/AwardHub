import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Layers,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesApi } from '../../api/categories';
import { nominationsApi } from '../../api/nominations';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function NomineeSubmitPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    categoryId: '',
    title: '',
    nomineeName: '',
    organization: '',
    summary: '',
    achievements: '',
    impactStatement: '',
    status: 'SUBMITTED',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingCats(true);
    try {
      const data = await categoriesApi.listPublic();
      const list = Array.isArray(data) ? data : [];
      setCategories(list);
      if (list.length > 0) {
        setForm((prev) => ({ ...prev, categoryId: list[0].id }));
      }
    } catch (err) {
      toast.error('Failed to load award categories');
    } finally {
      setLoadingCats(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.title || !form.nomineeName || !form.summary) {
      toast.error('Please fill in all mandatory nomination fields');
      return;
    }

    setSubmitting(true);
    try {
      await nominationsApi.create(form);
      toast.success('Nomination successfully submitted for review!');
      navigate('/nominee/nominations');
    } catch (err) {
      toast.error(err.message || 'Failed to submit nomination');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCats) {
    return <LoadingSpinner message="Preparing nomination wizard..." />;
  }

  const selectedCategory = categories.find((c) => String(c.id) === String(form.categoryId));

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/nominee/nominations')}>
          Back
        </Button>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
            Submit Award Nomination
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Complete the multi-step application to enter the candidate into competition
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
          { step: 2, label: 'Candidate Details', icon: FileText },
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
                  background: isCurrent || isDone ? 'var(--accent-primary)' : 'var(--bg-card)',
                  color: isCurrent || isDone ? '#fff' : 'var(--text-muted)',
                  border: isCurrent || isDone
                    ? '2px solid var(--accent-primary)'
                    : '2px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              >
                <Icon size={18} />
              </div>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: isCurrent ? 600 : 500,
                  color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
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
        <Card title="Step 1: Choose Award Category">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              Select from active award categories:
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '1rem',
              }}
            >
              {categories.map((cat) => {
                const isSelected = String(cat.id) === String(form.categoryId);
                return (
                  <div
                    key={cat.id}
                    onClick={() => setForm({ ...form, categoryId: cat.id })}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected
                        ? '2px solid var(--accent-primary)'
                        : '1px solid var(--border-color)',
                      background: isSelected ? 'var(--accent-soft)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--accent-primary)',
                      }}
                    >
                      {cat.code || 'CAT'}
                    </span>
                    <h4 style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '1rem', fontWeight: 600 }}>
                      {cat.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {cat.description || 'Excellence award category'}
                    </p>
                  </div>
                );
              })}
            </div>

            {selectedCategory && (selectedCategory.nominationRequirements || selectedCategory.nomineeEligibility || selectedCategory.nominationEndDate) && (
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-soft)',
                  border: '1px solid var(--accent-primary)',
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
                      Deadline: {selectedCategory.nominationEndDate.replace('T', ' ').slice(0, 16)}
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
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => setCurrentStep(2)}
              >
                Next: Candidate Details
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Nomination Information */}
      {currentStep === 2 && (
        <Card title="Step 2: Candidate & Project Details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Nomination / Project Title *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. NextGen Autonomous Medical Diagnostics Platform"
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Nominee / Candidate Name *
                </label>
                <input
                  type="text"
                  name="nomineeName"
                  value={form.nomineeName}
                  onChange={handleChange}
                  placeholder="Full name or Team lead"
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
                  Organization / Affiliation
                </label>
                <input
                  type="text"
                  name="organization"
                  value={form.organization}
                  onChange={handleChange}
                  placeholder="Company, Institute or Lab"
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
                Executive Summary *
              </label>
              <textarea
                name="summary"
                rows={3}
                value={form.summary}
                onChange={handleChange}
                placeholder="Briefly describe the candidate's core achievements and nomination justification..."
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
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Key Achievements & Breakthroughs
              </label>
              <textarea
                name="achievements"
                rows={3}
                value={form.achievements}
                onChange={handleChange}
                placeholder="Highlight quantifiable milestones, publications, patents, or market adoption..."
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

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <Button variant="secondary" onClick={() => setCurrentStep(1)}>
                Previous
              </Button>
              <Button
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => {
                  if (!form.title || !form.nomineeName || !form.summary) {
                    toast.error('Please complete title, candidate name, and summary');
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
        <Card title="Step 3: Verification & Official Submission">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                background: 'var(--bg-tertiary)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AWARD CATEGORY</span>
                <p style={{ margin: '0.15rem 0 0 0', fontWeight: 600 }}>{selectedCategory?.name}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PROJECT / SUBMISSION</span>
                <p style={{ margin: '0.15rem 0 0 0', fontWeight: 600 }}>{form.title}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CANDIDATE & ORG</span>
                <p style={{ margin: '0.15rem 0 0 0' }}>
                  {form.nomineeName} {form.organization ? `(${form.organization})` : ''}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>EXECUTIVE SUMMARY</span>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {form.summary}
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
              By submitting this nomination, you certify that all provided details and achievements
              are accurate and verifiable by the judging panel.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="secondary" onClick={() => setCurrentStep(2)}>
                Edit Details
              </Button>
              <Button
                variant="primary"
                icon={Send}
                loading={submitting}
                onClick={handleSubmit}
              >
                Submit Nomination
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
