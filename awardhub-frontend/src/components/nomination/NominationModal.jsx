import React, { useState } from 'react';
import { ExternalLink, AlertTriangle, FileText, CheckCircle2, Clock, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { nominationsApi, NOMINATION_STATUS_LABELS } from '../../api/nominations';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import { formatDateTime } from '../../utils/formatters';

const TITLE_MAX = 150;

/**
 * Detailed viewer for a NominationResponseDTO.
 * Shows status, category, title, description, supporting document,
 * rejection reason (if rejected), and review audit timestamps.
 */
export function NominationViewModal({ nomination, categoryName, isOpen, onClose }) {
  if (!nomination) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={nomination.title || `Nomination #${nomination.id}`}
      subtitle={`Ref #${nomination.id} • Category: ${categoryName || `Category #${nomination.categoryId}`}`}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Status header banner */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Status:</span>
            <StatusBadge status={nomination.status} label={NOMINATION_STATUS_LABELS[nomination.status] || nomination.status} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Created: {formatDateTime(nomination.createdAt)}
          </span>
        </div>

        {/* Rejection Alert if rejected */}
        {nomination.status === 'REJECTED' && (
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--status-error-soft)',
              border: '1px solid var(--status-error)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
            }}
          >
            <AlertTriangle size={20} style={{ color: 'var(--status-error)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <h5 style={{ margin: '0 0 0.25rem 0', color: 'var(--status-error)', fontWeight: 700, fontSize: '0.875rem' }}>
                Application Rejected by Award Committee
              </h5>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {nomination.rejectionReason || 'No specific rejection reason provided.'}
              </p>
              {nomination.reviewedAt && (
                <span style={{ display: 'block', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Decided on {formatDateTime(nomination.reviewedAt)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Approval Banner if approved */}
        {nomination.status === 'APPROVED' && (
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
            <CheckCircle2 size={20} style={{ color: 'var(--status-success)', flexShrink: 0 }} />
            <div>
              <span style={{ fontWeight: 600, color: 'var(--status-success)', fontSize: '0.875rem' }}>
                Qualified & Verified Finalist
              </span>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                This nomination has passed committee review and is eligible for voting and judging.
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Nomination Description & Case
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
            {nomination.description || 'No description provided.'}
          </div>
        </div>

        {/* Supporting Document */}
        {nomination.supportingDocument && (
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Supporting Document / Evidence Link
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
                href={nomination.supportingDocument}
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
                {nomination.supportingDocument}
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}

        {/* Review Audit Details */}
        {(nomination.reviewedBy || nomination.reviewedAt) && (
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '0.75rem',
            }}
          >
            {nomination.reviewedBy && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <UserCheck size={14} /> Reviewed by Staff #{nomination.reviewedBy}
              </span>
            )}
            {nomination.reviewedAt && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> Reviewed on {formatDateTime(nomination.reviewedAt)}
              </span>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

/**
 * Modal to edit an existing DRAFT nomination (PUT /api/nominations/{id}).
 */
export function NominationEditModal({ nomination, isOpen, onClose, onUpdated }) {
  const [form, setForm] = useState({
    title: nomination?.title || '',
    description: nomination?.description || '',
    supportingDocument: nomination?.supportingDocument || '',
  });
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (nomination) {
      setForm({
        title: nomination.title || '',
        description: nomination.description || '',
        supportingDocument: nomination.supportingDocument || '',
      });
    }
  }, [nomination]);

  if (!nomination) return null;

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (form.title.length > TITLE_MAX) {
      toast.error(`Title must not exceed ${TITLE_MAX} characters`);
      return;
    }

    setSaving(true);
    try {
      await nominationsApi.update(nomination.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        supportingDocument: form.supportingDocument.trim() || null,
      });
      toast.success('Draft nomination updated successfully');
      onClose();
      if (onUpdated) onUpdated();
    } catch (err) {
      toast.error(err.message || 'Failed to update nomination');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Edit Draft Nomination"
      subtitle={`Ref #${nomination.id}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Title *</label>
            <span style={{ fontSize: '0.75rem', color: form.title.length > TITLE_MAX ? 'var(--status-error)' : 'var(--text-muted)' }}>
              {form.title.length}/{TITLE_MAX}
            </span>
          </div>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. NextGen Autonomous Diagnostic Platform"
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
            Description & Justification *
          </label>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Detailed description of achievements, milestones, and credentials..."
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
              boxSizing: 'border-box',
            }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            Supporting Document URL
          </label>
          <input
            type="url"
            value={form.supportingDocument}
            onChange={(e) => setForm({ ...form, supportingDocument: e.target.value })}
            placeholder="https://example.com/whitepaper.pdf"
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
      </form>
    </Modal>
  );
}

/**
 * Modal for Organizer to enter a required rejection reason before rejecting a nomination.
 */
export function NominationRejectModal({ nomination, isOpen, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');

  React.useEffect(() => {
    if (isOpen) setReason('');
  }, [isOpen]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!reason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Reject Nomination"
      subtitle={`Ref #${nomination?.id} • ${nomination?.title}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" loading={loading} onClick={handleSubmit}>
            Confirm Rejection
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Please provide feedback or the regulatory justification for rejecting this dossier. This will be shared with the applicant.
        </p>
        <textarea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Supporting documentation does not demonstrate measurable low-carbon metrics required for this category..."
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
            boxSizing: 'border-box',
          }}
          required
        />
      </form>
    </Modal>
  );
}
