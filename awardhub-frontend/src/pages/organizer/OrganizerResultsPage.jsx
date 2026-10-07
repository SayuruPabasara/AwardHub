import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Calculator,
  Send,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Scale,
  Users,
  FileCheck,
  Award,
  Vote,
  Sparkles,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesApi } from '../../api/categories';
import { evaluationApi } from '../../api/evaluation';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function OrganizerResultsPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Readiness & calculation state
  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Results state
  const [resultSet, setResultSet] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);

  // Modals state
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishNote, setPublishNote] = useState('');
  const [publishing, setPublishing] = useState(false);

  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopening, setReopening] = useState(false);

  const [tieModalOpen, setTieModalOpen] = useState(false);
  const [tieForm, setTieForm] = useState({ winningNominationId: '', reason: '' });
  const [resolvingTie, setResolvingTie] = useState(false);

  const [auditLogs, setAuditLogs] = useState([]);
  const [showAudit, setShowAudit] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCatId) {
      loadCategoryData(selectedCatId);
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
      console.error('Failed to load categories:', err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryData = async (catId) => {
    setProgressLoading(true);
    setResultsLoading(true);
    try {
      // 1. Load progress/readiness
      const p = await evaluationApi.progress(catId).catch(() => null);
      setProgress(p);

      // 2. Load latest results
      const res = await evaluationApi.latestResults(catId).catch(() => null);
      setResultSet(res);
    } catch (err) {
      console.error('Error loading category results data:', err);
    } finally {
      setProgressLoading(false);
      setResultsLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!selectedCatId) return;
    setCalculating(true);
    try {
      const actorId = user?.id || 1;
      const res = await evaluationApi.calculate(selectedCatId, actorId);
      setResultSet(res);
      toast.success(`Results successfully calculated! (Version #${res.versionNo || 1})`);
      loadCategoryData(selectedCatId);
    } catch (err) {
      console.error('Calculation error:', err);
      toast.error(err.response?.data?.message || err.message || 'Calculation failed');
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!selectedCatId) return;
    try {
      const actorId = user?.id || 1;
      const res = await evaluationApi.submitForApproval(selectedCatId, actorId);
      setResultSet(res);
      toast.success('Results submitted for official approval!');
    } catch (err) {
      console.error('Approval submission error:', err);
      toast.error(err.response?.data?.message || err.message || 'Submission failed');
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!selectedCatId) return;
    setPublishing(true);
    try {
      const organizerId = user?.id || 1;
      const res = await evaluationApi.publish(selectedCatId, {
        organizerId,
        note: publishNote || 'Official results published by Award Organizer',
      });
      setResultSet(res);
      toast.success('Official results published! Winners are now publicly visible.');
      setPublishModalOpen(false);
      setPublishNote('');
    } catch (err) {
      console.error('Publish error:', err);
      toast.error(err.response?.data?.message || err.message || 'Publication failed');
    } finally {
      setPublishing(false);
    }
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) {
      toast.error('A reason is required to reopen published results.');
      return;
    }
    setReopening(true);
    try {
      const actorId = user?.id || 1;
      const res = await evaluationApi.reopenResults(selectedCatId, reopenReason, actorId);
      setResultSet(res);
      toast.success('Results reopened. You may now recalculate or adjust evaluations.');
      setReopenModalOpen(false);
      setReopenReason('');
    } catch (err) {
      console.error('Reopen error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to reopen results');
    } finally {
      setReopening(false);
    }
  };

  const handleResolveTie = async (e) => {
    e.preventDefault();
    if (!tieForm.winningNominationId || !tieForm.reason.trim()) {
      toast.error('Please specify winning nomination and justification reason.');
      return;
    }
    setResolvingTie(true);
    try {
      const actorId = user?.id || 1;
      const res = await evaluationApi.resolveTie(selectedCatId, {
        winningNominationId: tieForm.winningNominationId,
        reason: tieForm.reason,
      });
      setResultSet(res);
      toast.success('Tie resolved by manual decision!');
      setTieModalOpen(false);
      setTieForm({ winningNominationId: '', reason: '' });
    } catch (err) {
      console.error('Resolve tie error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to resolve tie');
    } finally {
      setResolvingTie(false);
    }
  };

  const loadAuditTrail = async () => {
    try {
      const logs = await evaluationApi.auditTrail();
      setAuditLogs(Array.isArray(logs) ? logs : []);
      setShowAudit(true);
    } catch (err) {
      toast.error('Could not load audit trail');
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCatId);

  // Check for unresolved tie
  const hasUnresolvedTie =
    resultSet?.entries &&
    resultSet.entries.some((e) => e.tieBreakNote && e.tieBreakNote.startsWith('Unresolved tie'));

  // Columns for ranking table
  const rankingColumns = [
    {
      key: 'rankPosition',
      label: 'Rank',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {row.winner ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: 'var(--gold-gradient)',
                color: 'var(--text-on-gold)',
                boxShadow: '0 2px 8px var(--accent-gold-soft)',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              <Trophy size={14} /> Winner
            </div>
          ) : val === 0 ? (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Excluded</span>
          ) : (
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              #{val}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'nomineeName',
      label: 'Candidate / Dossier',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{val || `Nominee #${row.nominationId}`}</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Dossier Ref #{row.nominationId}
          </span>
          {row.excludedReason && (
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--status-error)', marginTop: '0.125rem' }}>
              ⚠️ {row.excludedReason}
            </span>
          )}
          {row.tieBreakNote && (
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--status-special)', marginTop: '0.125rem' }}>
              ℹ️ {row.tieBreakNote}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'judgeScore',
      label: 'Judge Score',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600, color: val != null ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {val != null ? `${Number(val).toFixed(2)} pts` : '—'}
          </span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {row.judgesCounted || 0} Evaluators
          </span>
        </div>
      ),
    },
    {
      key: 'voteScore',
      label: 'Public Votes',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>
            {row.voteCount != null ? `${row.voteCount} votes` : '0 votes'}
          </span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Norm: {val != null ? `${Number(val).toFixed(2)} pts` : '0.00 pts'}
          </span>
        </div>
      ),
    },
    {
      key: 'finalScore',
      label: 'Composite Final Score',
      render: (val) => (
        <span
          style={{
            fontWeight: 800,
            fontSize: '1.1rem',
            color: 'var(--accent-primary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {val != null ? Number(val).toFixed(2) : '—'}
        </span>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Loading categories and result calculation engine..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Award size={28} color="var(--accent-primary)" />
            Result Calculation & Publication
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Manage category evaluation readiness, execute deterministic scoring snapshots, resolve ties, and publish official winners.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" size="sm" icon={ShieldCheck} onClick={loadAuditTrail}>
            View Audit Log
          </Button>
        </div>
      </div>

      {/* Category selector row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select Award Category:</label>
        <select
          value={selectedCatId || ''}
          onChange={(e) => setSelectedCatId(Number(e.target.value))}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            outline: 'none',
            minWidth: '280px',
          }}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({cat.status})
            </option>
          ))}
        </select>

        {selectedCategory && (
          <StatusBadge status={selectedCategory.status} label={selectedCategory.status} />
        )}
      </div>

      {/* Readiness & Progress Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          icon={Users}
          title="Approved Dossiers"
          value={progress ? progress.nominations : '—'}
          accent="blue"
        />
        <StatCard
          icon={Scale}
          title="Assigned Judges"
          value={progress ? progress.judges : '—'}
          accent="purple"
        />
        <StatCard
          icon={FileCheck}
          title="Submitted Evaluations"
          value={progress ? `${progress.submittedEvaluations} / ${progress.expectedEvaluations}` : '—'}
          accent="green"
        />
        <StatCard
          icon={Calculator}
          title="Calculation Readiness"
          value={progress ? (progress.readyToCalculate ? 'Ready' : 'Blocked') : '—'}
          accent={progress?.readyToCalculate ? 'green' : 'amber'}
        />
      </div>

      {/* Blocker Alert (if any) */}
      {progress?.blocker && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--status-error-soft)',
            border: '1px solid color-mix(in srgb, var(--status-error) 30%, transparent)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--status-error)',
          }}
        >
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ fontSize: '0.9rem' }}>Evaluation Blocker:</strong>{' '}
            <span style={{ fontSize: '0.875rem' }}>{progress.blocker}</span>
          </div>
        </div>
      )}

      {/* Unresolved Tie Alert (if any) */}
      {hasUnresolvedTie && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--status-warning-soft)',
            border: '1px solid color-mix(in srgb, var(--status-warning) 30%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={22} color="var(--status-warning)" />
            <div>
              <strong style={{ color: 'var(--status-warning)', fontSize: '0.95rem' }}>
                Unresolved Tie at Top Rank!
              </strong>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Deterministic scoring resulted in identical composite scores. A manual organizer decision is required before results can be published.
              </p>
            </div>
          </div>
          <Button
            variant="warning"
            size="sm"
            onClick={() => {
              const tied = resultSet?.entries?.filter((e) => e.rankPosition === 1) || [];
              if (tied.length > 0) {
                setTieForm({ winningNominationId: String(tied[0].nominationId), reason: '' });
              }
              setTieModalOpen(true);
            }}
          >
            Resolve Tie Manually
          </Button>
        </div>
      )}

      {/* Results Snapshot & Actions Card */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>Category Official Results</span>
              {resultSet && (
                <StatusBadge
                  status={resultSet.status}
                  label={resultSet.status}
                />
              )}
            </div>

            {/* Workflow Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Calculate / Recalculate button */}
              {(!resultSet || resultSet.status !== 'PUBLISHED') && (
                <Button
                  variant="primary"
                  icon={Calculator}
                  loading={calculating}
                  disabled={!progress?.readyToCalculate}
                  onClick={handleCalculate}
                >
                  {resultSet ? 'Recalculate Results' : 'Calculate Results'}
                </Button>
              )}

              {/* Submit for approval button */}
              {resultSet?.status === 'CALCULATED' && (
                <Button
                  variant="outline"
                  icon={CheckCircle}
                  onClick={handleSubmitForApproval}
                >
                  Submit for Approval
                </Button>
              )}

              {/* Publish button */}
              {(resultSet?.status === 'PENDING_APPROVAL' || resultSet?.status === 'CALCULATED') && (
                <Button
                  variant="primary"
                  icon={Send}
                  disabled={hasUnresolvedTie}
                  onClick={() => setPublishModalOpen(true)}
                >
                  Publish Official Results
                </Button>
              )}

              {/* Reopen button */}
              {resultSet?.status === 'PUBLISHED' && (
                <Button
                  variant="outline"
                  icon={RotateCcw}
                  onClick={() => setReopenModalOpen(true)}
                >
                  Reopen Results for Editing
                </Button>
              )}
            </div>
          </div>
        }
      >
        {resultsLoading ? (
          <LoadingSpinner message="Loading calculated rankings..." />
        ) : resultSet ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Snapshot metadata banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div>
                Snapshot Version: <strong>v{resultSet.versionNo}</strong> • Mode:{' '}
                <strong>{resultSet.modeSnapshot}</strong> • Calculated:{' '}
                <strong>{resultSet.calculatedAt ? new Date(resultSet.calculatedAt).toLocaleString() : '—'}</strong>
              </div>
              <div>
                Judge Weight: <strong>{Math.round(Number(resultSet.judgeWeightSnapshot || 0.7) * 100)}%</strong> • Public Vote Weight:{' '}
                <strong>{Math.round(Number(resultSet.publicWeightSnapshot || 0.3) * 100)}%</strong>
              </div>
            </div>

            {/* Rankings Table */}
            <DataTable
              columns={rankingColumns}
              data={resultSet.entries || []}
              keyField="nominationId"
              emptyMessage="No candidates evaluated in this result snapshot."
            />
          </div>
        ) : (
          <EmptyState
            icon={Calculator}
            title="No Results Calculated Yet"
            description="Run the scoring snapshot once judges have submitted their multi-criteria evaluations."
            action={
              progress?.readyToCalculate ? (
                <Button variant="primary" icon={Calculator} loading={calculating} onClick={handleCalculate}>
                  Calculate Results Now
                </Button>
              ) : null
            }
          />
        )}
      </Card>

      {/* Publish Modal */}
      <Modal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        title="Publish Official Award Results"
      >
        <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            Publishing marks the official announcement of the winners for this category. Once published, the rankings and winner badges will be publicly visible to voters and participants.
          </p>
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Announcement / Auditor Note (Optional):
            </label>
            <textarea
              rows={3}
              value={publishNote}
              onChange={(e) => setPublishNote(e.target.value)}
              placeholder="e.g. Certified by Award Organizing Committee following multi-stage evaluation."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setPublishModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Send} loading={publishing} type="submit">
              Confirm Publication
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reopen Modal */}
      <Modal
        isOpen={reopenModalOpen}
        onClose={() => setReopenModalOpen(false)}
        title="Reopen Published Results"
      >
        <form onSubmit={handleReopen} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            Reopening published results reverts the category status to <strong>CALCULATED</strong> and logs an immutable audit entry. Recalculation will be enabled.
          </p>
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Mandatory Reason for Recalculation:
            </label>
            <textarea
              rows={3}
              required
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Provide a formal justification for reopening (e.g., late verified score correction, disqualification appeal)..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setReopenModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={RotateCcw} loading={reopening} type="submit">
              Reopen Results
            </Button>
          </div>
        </form>
      </Modal>

      {/* Resolve Tie Modal */}
      <Modal
        isOpen={tieModalOpen}
        onClose={() => setTieModalOpen(false)}
        title="Resolve Unresolved Tie Manually"
      >
        <form onSubmit={handleResolveTie} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            Select which tied nominee is designated as the primary winner. An immutable audit record will track this decision.
          </p>
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Designated Winner Dossier:
            </label>
            <select
              value={tieForm.winningNominationId}
              onChange={(e) => setTieForm({ ...tieForm, winningNominationId: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            >
              {(resultSet?.entries || []).map((e) => (
                <option key={e.nominationId} value={e.nominationId}>
                  #{e.nominationId} — {e.nomineeName} (Score: {e.finalScore})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Tie-Breaker Justification:
            </label>
            <textarea
              rows={3}
              required
              value={tieForm.reason}
              onChange={(e) => setTieForm({ ...tieForm, reason: e.target.value })}
              placeholder="e.g. Deliberated by jury panel: awarded for exceptional technical innovation in criterion #1."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setTieModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={resolvingTie} type="submit">
              Apply Decision
            </Button>
          </div>
        </form>
      </Modal>

      {/* Audit Log Modal */}
      <Modal
        isOpen={showAudit}
        onClose={() => setShowAudit(false)}
        title="Evaluation & Results Audit Trail"
      >
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {auditLogs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.825rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{log.action}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Actor #{log.actorId || 'System'} • Target: {log.targetType} #{log.targetId}
                  </div>
                  {log.details && (
                    <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.775rem' }}>
                      {log.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '2rem 0' }}>
              No audit records found.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
