import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sliders,
  Save,
  Send,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Lock,
  Scale,
  Award,
  Info,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { evaluationApi } from '../../api/evaluation';
import { categoriesApi } from '../../api/categories';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import JudgeScoringChart from '../../components/charts/JudgeScoringChart';

export default function JudgeScoringPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const nominationId = searchParams.get('nominationId');
  const initialCategoryId = searchParams.get('categoryId');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [worklistTasks, setWorklistTasks] = useState([]);
  const [activeNominationId, setActiveNominationId] = useState(nominationId);
  const [categoryId, setCategoryId] = useState(initialCategoryId ? Number(initialCategoryId) : null);
  const [categoryName, setCategoryName] = useState('');
  const [nomineeName, setNomineeName] = useState('');
  const [rubric, setRubric] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState({});
  const [comments, setComments] = useState('');
  const [evaluationStatus, setEvaluationStatus] = useState(null);
  const [submittedAt, setSubmittedAt] = useState(null);

  useEffect(() => {
    initPage();
  }, [nominationId, initialCategoryId, user]);

  const initPage = async () => {
    setLoading(true);
    try {
      const judgeId = user?.id || 1;

      // 1. Fetch judge's worklist tasks
      let tasks = [];
      try {
        const wl = await evaluationApi.worklist(judgeId);
        tasks = Array.isArray(wl) ? wl : [];
        setWorklistTasks(tasks);
      } catch (e) {
        console.warn('Could not fetch worklist:', e);
      }

      let currentNomId = nominationId;
      let effectiveCatId = initialCategoryId ? Number(initialCategoryId) : categoryId;

      // 2. If no nominationId in URL, auto-select the first pending (or first) task
      if (!currentNomId) {
        if (tasks.length > 0) {
          const pending = tasks.find(
            (t) => t.status !== 'SUBMITTED' && t.status !== 'VERIFIED' && t.status !== 'LOCKED'
          );
          const chosen = pending || tasks[0];
          currentNomId = String(chosen.nominationId);
          effectiveCatId = chosen.categoryId;
          setActiveNominationId(currentNomId);
          setCategoryId(effectiveCatId);
          setCategoryName(chosen.categoryName || '');
          setNomineeName(chosen.displayName || `Nominee #${currentNomId}`);
          setSearchParams(
            { nominationId: currentNomId, categoryId: String(effectiveCatId) },
            { replace: true }
          );
        } else {
          // No tasks allocated to this judge
          setLoading(false);
          return;
        }
      } else {
        setActiveNominationId(currentNomId);
        const task = tasks.find((t) => String(t.nominationId) === String(currentNomId));
        if (task) {
          if (!effectiveCatId) effectiveCatId = task.categoryId;
          setCategoryName(task.categoryName || '');
          setNomineeName(task.displayName || `Nominee #${currentNomId}`);
        }
      }

      // If categoryId is still unknown, try fallback
      if (!effectiveCatId) {
        const cats = await categoriesApi.list().catch(() => []);
        const list = Array.isArray(cats) ? cats : [];
        if (list.length > 0) {
          effectiveCatId = list[0].id;
          setCategoryName(list[0].name);
        }
      }

      setCategoryId(effectiveCatId);

      if (!effectiveCatId) {
        setLoading(false);
        return;
      }

      // 3. Fetch active rubric for the category
      let activeRubric = null;
      try {
        activeRubric = await evaluationApi.activeRubric(effectiveCatId);
      } catch (err) {
        console.warn('Could not fetch active rubric, attempting fallback:', err);
      }

      const rubricCriteria =
        activeRubric?.criteria && activeRubric.criteria.length > 0
          ? activeRubric.criteria
          : [
              { id: 1, name: 'Technical & Creative Innovation', description: 'Originality and novelty', weight: 0.35 },
              { id: 2, name: 'Quantifiable Impact & Scalability', description: 'Real-world value and growth potential', weight: 0.35 },
              { id: 3, name: 'Execution & Presentation Quality', description: 'Soundness of delivery and evidence', weight: 0.30 },
            ];

      setRubric(activeRubric);
      setCriteria(rubricCriteria);

      // 4. Fetch existing evaluation draft/submission
      let existingEval = null;
      try {
        existingEval = await evaluationApi.getOne(currentNomId, judgeId);
      } catch (e) {
        // No draft yet
      }

      const initialScores = {};
      const initialNotes = {};

      if (existingEval) {
        setEvaluationStatus(existingEval.status);
        setSubmittedAt(existingEval.submittedAt);
        setComments(existingEval.comments || '');

        if (Array.isArray(existingEval.scores)) {
          existingEval.scores.forEach((s) => {
            initialScores[s.criterionId] = Number(s.rawScore);
            if (s.note) initialNotes[s.criterionId] = s.note;
          });
        }
      } else {
        setEvaluationStatus(null);
        setSubmittedAt(null);
        setComments('');
      }

      // Fill missing criteria with midpoint default
      const defaultScore =
        Math.round(((activeRubric?.scaleMax || 100) + (activeRubric?.scaleMin || 1)) / 2) || 75;
      rubricCriteria.forEach((c) => {
        if (initialScores[c.id] === undefined) {
          initialScores[c.id] = defaultScore;
        }
      });

      setScores(initialScores);
      setNotes(initialNotes);
    } catch (err) {
      console.error('Initialization error in JudgeScoringPage:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (criterionId, val) => {
    setScores((prev) => ({ ...prev, [criterionId]: Number(val) }));
  };

  const handleNoteChange = (criterionId, val) => {
    setNotes((prev) => ({ ...prev, [criterionId]: val }));
  };

  const handleSwitchCandidate = (newNomId) => {
    const sel = worklistTasks.find((t) => String(t.nominationId) === String(newNomId));
    if (sel) {
      setSearchParams(
        { nominationId: String(sel.nominationId), categoryId: String(sel.categoryId) },
        { replace: true }
      );
    }
  };

  const calculateWeightedTotal = () => {
    if (!criteria || criteria.length === 0) return '0.0';
    let total = 0;
    criteria.forEach((c) => {
      const score = scores[c.id] !== undefined ? scores[c.id] : 0;
      const weight = Number(c.weight) || 0;
      total += score * weight;
    });
    return total.toFixed(1);
  };

  const isLocked =
    evaluationStatus === 'SUBMITTED' ||
    evaluationStatus === 'VERIFIED' ||
    evaluationStatus === 'LOCKED';

  const handleSaveEvaluation = async (isSubmit) => {
    const effectiveNomId = activeNominationId || nominationId;
    if (!effectiveNomId || !categoryId) {
      toast.error('Dossier or category context missing.');
      return;
    }

    if (isSubmit) {
      setSubmitting(true);
    } else {
      setSaving(true);
    }

    try {
      const judgeId = user?.id || 1;
      const payload = {
        nominationId: Number(effectiveNomId),
        judgeId: Number(judgeId),
        scores: criteria.map((c) => ({
          criterionId: Number(c.id),
          rawScore: Number(scores[c.id] !== undefined ? scores[c.id] : 75),
          note: notes[c.id] || null,
        })),
        comments: comments || '',
        submit: Boolean(isSubmit),
      };

      const result = await evaluationApi.saveOrSubmit(categoryId, payload);

      if (isSubmit) {
        toast.success('Evaluation grade officially submitted and locked!');
        setEvaluationStatus('SUBMITTED');
        navigate('/judge/worklist');
      } else {
        toast.success('Draft evaluation successfully saved.');
        setEvaluationStatus('DRAFT');
        if (result?.id) {
          setEvaluationStatus(result.status || 'DRAFT');
        }
      }
    } catch (err) {
      console.error('Evaluation save error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to save evaluation.');
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  const radarData = criteria.map((c) => ({
    criterion: c.name.length > 18 ? c.name.slice(0, 16) + '...' : c.name,
    score: scores[c.id] || 0,
  }));

  if (loading) {
    return <LoadingSpinner message="Loading rubric dimensions and candidate dossier..." />;
  }

  // If judge has no assigned tasks
  if (worklistTasks.length === 0 && !activeNominationId) {
    return (
      <div style={{ maxWidth: 800, margin: '2rem auto' }}>
        <Card>
          <EmptyState
            icon={Sliders}
            title="No Candidate Dossiers Assigned"
            description="You do not have any candidate dossiers currently assigned to your evaluation panel. Once an award category is allocated to your panel, approved nominations will appear here for review."
            action={
              <Button variant="primary" onClick={() => navigate('/judge/worklist')}>
                View Evaluation Worklist
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const scaleMin = rubric?.scaleMin || 1;
  const scaleMax = rubric?.scaleMax || 100;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/judge/worklist')}>
            Back to Worklist
          </Button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
                Evaluation Rubric Scoring
              </h1>
              {evaluationStatus && (
                <StatusBadge
                  status={evaluationStatus}
                  label={evaluationStatus === 'SUBMITTED' ? 'Submitted & Locked' : evaluationStatus}
                />
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
              Candidate: <strong>{nomineeName || `Dossier #${activeNominationId}`}</strong> • Category:{' '}
              <strong>{categoryName || `Category #${categoryId}`}</strong>
            </p>
          </div>
        </div>

        {/* Candidate Switcher Dropdown (if multiple dossiers) */}
        {worklistTasks.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Switch Dossier:</span>
            <select
              value={activeNominationId || ''}
              onChange={(e) => handleSwitchCandidate(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.825rem',
                outline: 'none',
              }}
            >
              {worklistTasks.map((t) => (
                <option key={t.nominationId} value={t.nominationId}>
                  {t.displayName || `Candidate #${t.nominationId}`} ({t.categoryName}) —{' '}
                  {t.totalScore != null ? 'Graded' : 'Pending'}
                </option>
              ))}
            </select>
          </div>
        )}

        {isLocked && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--status-info-soft)',
              border: '1px solid color-mix(in srgb, var(--status-info) 30%, transparent)',
              color: 'var(--status-info)',
              fontSize: '0.825rem',
            }}
          >
            <Lock size={16} />
            <span>Evaluation is officially submitted and locked</span>
          </div>
        )}
      </div>

      {isLocked && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <Info size={20} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            This evaluation was submitted on{' '}
            <strong>{submittedAt ? new Date(submittedAt).toLocaleString() : 'earlier session'}</strong>.
            The rubric scores are in final locked state. If revision is necessary, contact the award organizer to unlock and reopen this evaluation.
          </div>
        </div>
      )}

      {/* Main 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Criteria sliders & notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title={`Active Evaluation Rubric (${criteria.length} Criteria)`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {criteria.map((crit, idx) => {
                const currentScore = scores[crit.id] !== undefined ? scores[crit.id] : scaleMin;
                const weightPercent = Math.round(Number(crit.weight) * 100);

                return (
                  <div
                    key={crit.id || idx}
                    style={{
                      paddingBottom: idx === criteria.length - 1 ? 0 : '1.5rem',
                      borderBottom: idx === criteria.length - 1 ? 'none' : '1px solid var(--border-color)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.375rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{crit.name}</span>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '999px',
                              background: 'var(--accent-gold-soft)',
                              color: 'var(--accent-gold-text)',
                              border: '1px solid color-mix(in srgb, var(--accent-gold) 30%, transparent)',
                              fontWeight: 600,
                            }}
                          >
                            Weight: {weightPercent}%
                          </span>
                        </div>
                        {crit.description && (
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {crit.description}
                          </p>
                        )}
                      </div>

                      <span
                        style={{
                          fontWeight: 700,
                          color: 'var(--accent-primary)',
                          fontSize: '1.125rem',
                          fontVariantNumeric: 'tabular-nums',
                          padding: '0.25rem 0.625rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-input)',
                        }}
                      >
                        {currentScore} / {scaleMax}
                      </span>
                    </div>

                    {/* Range slider */}
                    <input
                      type="range"
                      min={scaleMin}
                      max={scaleMax}
                      value={currentScore}
                      disabled={isLocked}
                      onChange={(e) => handleScoreChange(crit.id, e.target.value)}
                      style={{
                        width: '100%',
                        accentColor: 'var(--accent-primary)',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        marginTop: '0.5rem',
                      }}
                    />

                    {/* Criterion note input */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <input
                        type="text"
                        disabled={isLocked}
                        value={notes[crit.id] || ''}
                        onChange={(e) => handleNoteChange(crit.id, e.target.value)}
                        placeholder="Optional criterion specific note or justification..."
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          fontSize: '0.8rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Evaluator Qualitative Comments & Recommendations">
            <textarea
              rows={4}
              disabled={isLocked}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide constructive feedback highlighting standout strengths, verifiable benchmarks, and areas for improvement..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
                resize: 'vertical',
                cursor: isLocked ? 'not-allowed' : 'text',
              }}
            />
          </Card>

          {/* Action buttons */}
          {!isLocked ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
              <Button variant="secondary" onClick={() => navigate('/judge/worklist')}>
                Cancel
              </Button>
              <Button
                variant="outline"
                icon={Save}
                loading={saving}
                disabled={submitting}
                onClick={() => handleSaveEvaluation(false)}
              >
                Save as Draft
              </Button>
              <Button
                variant="primary"
                icon={Send}
                loading={submitting}
                disabled={saving}
                onClick={() => handleSaveEvaluation(true)}
              >
                Submit & Finalize Evaluation
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => navigate('/judge/worklist')}>
                Return to Worklist
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Composite score & Radar Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '1.5rem' }}>
          <Card title="Weighted Score Composite">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem 0',
              }}
            >
              <span
                style={{
                  fontSize: '3.75rem',
                  fontWeight: 800,
                  color: 'var(--accent-primary)',
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {calculateWeightedTotal()}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Normalized Overall Score / {scaleMax}
              </span>

              <div
                style={{
                  marginTop: '1.25rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Scale Range:</span>
                <strong>
                  {scaleMin} to {scaleMax} pts
                </strong>
              </div>
            </div>
          </Card>

          <Card title="Criteria Radar Profile">
            <JudgeScoringChart data={radarData} />
          </Card>
        </div>
      </div>
    </div>
  );
}
