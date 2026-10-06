import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Inbox, CircleDot, Loader, CheckCircle2, XCircle, Send, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { feedbackApi, FEEDBACK_STATUSES, FEEDBACK_TRANSITIONS } from '../../api/reports';
import { categoriesApi } from '../../api/categories';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import StatCard from '../../components/ui/StatCard';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import FeedbackThread, { StarDisplay } from '../../components/reports/FeedbackThread';
import { formatDateTime, formatRelativeTime, truncateText } from '../../utils/formatters';
import { unwrapList, humanize, buildCategoryMap } from '../../utils/reportHelpers';
import styles from '../../components/reports/reports.module.css';

const REPLY_MAX = 2000;
const STATUS_META = {
  OPEN: { icon: CircleDot, accent: 'green' },
  IN_PROGRESS: { icon: Loader, accent: 'blue' },
  RESOLVED: { icon: CheckCircle2, accent: 'purple' },
  CLOSED: { icon: XCircle, accent: 'amber' },
};
const TRANSITION_VARIANT = { IN_PROGRESS: 'outline', RESOLVED: 'success', CLOSED: 'secondary' };

/**
 * Staff inbox (ORGANIZER / ADMIN).
 * Covers GET /api/feedback, GET /status/{s}, PUT /{id}/status,
 * POST + GET /api/feedback/{id}/replies.
 */
export default function OrganizerFeedbackPage() {
  const { user } = useAuth();
  const [allItems, setAllItems] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const [categories, setCategories] = useState([]);
  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories]);

  const [selected, setSelected] = useState(null);
  const [replies, setReplies] = useState([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    categoriesApi
      .list()
      .then((res) => setCategories(unwrapList(res)))
      .catch(() => setCategories([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = unwrapList(await feedbackApi.getAll());
      setAllItems(all);
      const filtered = statusFilter ? unwrapList(await feedbackApi.getByStatus(statusFilter)) : all;
      setItems([...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      return all;
    } catch (err) {
      toast.error(err.message || 'Failed to load feedback');
      setItems([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0 };
    allItems.forEach((f) => {
      if (c[f.status] !== undefined) c[f.status] += 1;
    });
    return c;
  }, [allItems]);

  const loadReplies = useCallback(async (feedbackId) => {
    setRepliesLoading(true);
    try {
      setReplies(unwrapList(await feedbackApi.getReplies(feedbackId)));
    } catch (err) {
      toast.error(err.message || 'Failed to load replies');
      setReplies([]);
    } finally {
      setRepliesLoading(false);
    }
  }, []);

  const openDetail = (fb) => {
    setSelected(fb);
    setReplyText('');
    loadReplies(fb.id);
  };

  /** Reload list and re-sync the open item (status may change server-side). */
  const refreshSelected = async (id) => {
    const all = await load();
    const fresh = all.find((f) => f.id === id);
    if (fresh) setSelected(fresh);
  };

  const handleReply = async () => {
    const message = replyText.trim();
    if (!message) return toast.error('Reply cannot be empty');
    if (message.length > REPLY_MAX) return toast.error(`Reply must not exceed ${REPLY_MAX} characters`);
    setReplying(true);
    try {
      await feedbackApi.addReply(selected.id, { userId: user.id, message });
      toast.success(selected.status === 'OPEN' ? 'Reply sent · moved to In Progress' : 'Reply sent');
      setReplyText('');
      await Promise.all([loadReplies(selected.id), refreshSelected(selected.id)]);
    } catch (err) {
      toast.error(err.message || 'Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  const handleStatus = async (next) => {
    setUpdatingStatus(next);
    try {
      await feedbackApi.updateStatus(selected.id, next);
      toast.success(`Marked as ${humanize(next)}`);
      await refreshSelected(selected.id);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const columns = [
    {
      key: 'subject',
      label: 'Feedback',
      render: (val, row) => (
        <div>
          <span className={styles.cellTitle}>{val}</span>
          <span className={styles.cellSub}>{truncateText(row.message, 80)}</span>
        </div>
      ),
    },
    { key: 'feedbackType', label: 'Type', render: (v) => <span className={styles.typeTag}>{v}</span> },
    { key: 'username', label: 'From' },
    { key: 'rating', label: 'Rating', render: (v) => (v ? <StarDisplay value={v} size={12} /> : '—') },
    {
      key: 'replies',
      label: 'Replies',
      sortable: false,
      render: (v) => v?.length || 0,
    },
    { key: 'createdAt', label: 'Received', render: (v) => formatRelativeTime(v) },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} label={humanize(v)} /> },
  ];

  const allowedNext = selected ? FEEDBACK_TRANSITIONS[selected.status] || [] : [];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Feedback Inbox</h1>
          <p className={styles.pageSubtitle}>Triage, reply to, and resolve feedback from all users</p>
        </div>
        <Button id="feedback-inbox-refresh" variant="secondary" icon={RefreshCw} onClick={load}>
          Refresh
        </Button>
      </div>

      <div className={styles.statsRow}>
        {FEEDBACK_STATUSES.map((s) => (
          <StatCard
            key={s}
            title={humanize(s)}
            value={counts[s]}
            icon={STATUS_META[s].icon}
            accent={STATUS_META[s].accent}
          />
        ))}
      </div>

      <Card padding="none">
        <div className={styles.toolbar}>
          <div className={styles.chips}>
            <button
              id="feedback-filter-all"
              className={`${styles.chip} ${!statusFilter ? styles.chipActive : ''}`}
              onClick={() => setStatusFilter('')}
            >
              All ({allItems.length})
            </button>
            {FEEDBACK_STATUSES.map((s) => (
              <button
                key={s}
                id={`feedback-filter-${s.toLowerCase()}`}
                className={`${styles.chip} ${statusFilter === s ? styles.chipActive : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {humanize(s)} ({counts[s]})
              </button>
            ))}
          </div>
        </div>
        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          onRowClick={openDetail}
          emptyMessage="No feedback"
          emptyDescription={statusFilter ? `Nothing in ${humanize(statusFilter)}.` : 'No users have submitted feedback yet.'}
        />
      </Card>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        size="lg"
        title={selected?.subject}
        subtitle={selected ? `#${selected.id} · from ${selected.username} · ${formatDateTime(selected.createdAt)}` : ''}
        headerContent={
          selected && (
            <div className={styles.fbMeta}>
              <StatusBadge status={selected.status} label={humanize(selected.status)} size="md" />
              <span className={styles.typeTag}>{selected.feedbackType}</span>
              <StarDisplay value={selected.rating} />
              {selected.categoryId && (
                <span className={styles.cellSub} style={{ margin: 0 }}>
                  {categoryMap[selected.categoryId] || `Category #${selected.categoryId}`}
                </span>
              )}
            </div>
          )
        }
      >
        {selected && (
          <>
            <h4 className={styles.sectionTitle} style={{ marginTop: 0 }}>Conversation</h4>
            {repliesLoading ? (
              <LoadingSpinner message="Loading replies..." />
            ) : (
              <FeedbackThread feedback={selected} replies={replies} />
            )}

            {selected.status !== 'CLOSED' && (
              <>
                <h4 className={styles.sectionTitle}>Reply</h4>
                <label className={styles.label} htmlFor="feedback-reply-text">
                  <span>Message</span>
                  <span className={`${styles.counter} ${replyText.length > REPLY_MAX ? styles.counterOver : ''}`}>
                    {replyText.length}/{REPLY_MAX}
                  </span>
                </label>
                <textarea
                  id="feedback-reply-text"
                  className={styles.textarea}
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a response to the user…"
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.6rem' }}>
                  <Button id="feedback-reply-send" variant="primary" icon={Send} onClick={handleReply} loading={replying}>
                    Send reply
                  </Button>
                </div>
              </>
            )}

            <h4 className={styles.sectionTitle}>Status</h4>
            {allowedNext.length === 0 ? (
              <p className={styles.hint} style={{ margin: 0 }}>This feedback is closed. No further transitions.</p>
            ) : (
              <div className={styles.statusActions}>
                {allowedNext.map((next) => (
                  <Button
                    key={next}
                    id={`feedback-status-${next.toLowerCase()}`}
                    size="sm"
                    variant={TRANSITION_VARIANT[next] || 'secondary'}
                    loading={updatingStatus === next}
                    disabled={!!updatingStatus}
                    onClick={() => handleStatus(next)}
                  >
                    Mark {humanize(next)}
                  </Button>
                ))}
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
