import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Send, MessageSquare, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { feedbackApi, FEEDBACK_TYPES } from '../../api/reports';
import { categoriesApi } from '../../api/categories';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import FeedbackThread, { StarInput, StarDisplay } from '../../components/reports/FeedbackThread';
import { formatRelativeTime } from '../../utils/formatters';
import { unwrapList, humanize, buildCategoryMap } from '../../utils/reportHelpers';
import styles from '../../components/reports/reports.module.css';

const SUBJECT_MAX = 150;
const MESSAGE_MAX = 2000;
const EMPTY_FORM = { subject: '', message: '', feedbackType: 'SUGGESTION', rating: null, categoryId: '' };

/**
 * Available to every authenticated role.
 * Covers POST /api/feedback and GET /api/feedback/user/{userId}.
 */
export default function FeedbackPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const [categories, setCategories] = useState([]);
  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories]);

  useEffect(() => {
    categoriesApi
      .listPublic()
      .then((res) => setCategories(unwrapList(res)))
      .catch(() => setCategories([]));
  }, []);

  const loadMine = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const list = unwrapList(await feedbackApi.getByUser(user.id));
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setItems(list);
    } catch (err) {
      toast.error(err.message || 'Failed to load your feedback');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadMine();
  }, [loadMine]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const subject = form.subject.trim();
    const message = form.message.trim();
    if (!subject) return toast.error('Subject is required');
    if (!message) return toast.error('Message is required');
    if (subject.length > SUBJECT_MAX) return toast.error(`Subject must not exceed ${SUBJECT_MAX} characters`);
    if (message.length > MESSAGE_MAX) return toast.error(`Message must not exceed ${MESSAGE_MAX} characters`);

    setSubmitting(true);
    try {
      await feedbackApi.submit({
        userId: user.id,
        subject,
        message,
        feedbackType: form.feedbackType,
        rating: form.rating || null,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
      });
      toast.success('Thanks! Your feedback was submitted.');
      setForm(EMPTY_FORM);
      loadMine();
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Feedback</h1>
          <p className={styles.pageSubtitle}>
            Report issues, suggest improvements, or share praise with the award committee
          </p>
        </div>
      </div>

      <div className={styles.layout2}>
        <Card title="Send feedback" subtitle="The committee will reply here">
          <form className={styles.form} onSubmit={handleSubmit}>
            <div>
              <label className={styles.label} htmlFor="feedback-type">Type *</label>
              <div className={styles.chips} id="feedback-type">
                {FEEDBACK_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    id={`feedback-type-${t.toLowerCase()}`}
                    className={`${styles.chip} ${form.feedbackType === t ? styles.chipActive : ''}`}
                    onClick={() => setForm({ ...form, feedbackType: t })}
                  >
                    {humanize(t)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={styles.label} htmlFor="feedback-subject">
                <span>Subject *</span>
                <span className={`${styles.counter} ${form.subject.length > SUBJECT_MAX ? styles.counterOver : ''}`}>
                  {form.subject.length}/{SUBJECT_MAX}
                </span>
              </label>
              <input
                id="feedback-subject"
                className={styles.input}
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Short summary"
                required
              />
            </div>

            <div>
              <label className={styles.label} htmlFor="feedback-message">
                <span>Message *</span>
                <span className={`${styles.counter} ${form.message.length > MESSAGE_MAX ? styles.counterOver : ''}`}>
                  {form.message.length}/{MESSAGE_MAX}
                </span>
              </label>
              <textarea
                id="feedback-message"
                className={styles.textarea}
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us more…"
                required
              />
            </div>

            <div className={styles.grid2}>
              <div>
                <label className={styles.label}>Rating</label>
                <StarInput
                  idPrefix="feedback-rating"
                  value={form.rating}
                  onChange={(rating) => setForm({ ...form, rating })}
                />
              </div>
              <div>
                <label className={styles.label} htmlFor="feedback-category">Related category</label>
                <select
                  id="feedback-category"
                  className={styles.select}
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{categoryMap[c.id]}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button id="feedback-submit" type="submit" variant="primary" icon={Send} loading={submitting} fullWidth>
              Submit feedback
            </Button>
          </form>
        </Card>

        <Card
          title="My feedback"
          subtitle={`${items.length} submission${items.length === 1 ? '' : 's'}`}
          actions={
            <Button id="feedback-refresh" size="sm" variant="ghost" icon={RefreshCw} onClick={loadMine}>
              Refresh
            </Button>
          }
        >
          {loading ? (
            <LoadingSpinner message="Loading your feedback..." />
          ) : items.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No feedback yet"
              description="Anything you submit will appear here along with committee replies."
            />
          ) : (
            <div className={styles.fbList}>
              {items.map((fb) => {
                const open = expanded === fb.id;
                const replyCount = fb.replies?.length || 0;
                return (
                  <div key={fb.id} className={styles.fbCard}>
                    <button
                      id={`my-feedback-${fb.id}`}
                      className={styles.fbHead}
                      onClick={() => setExpanded(open ? null : fb.id)}
                      aria-expanded={open}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div className={styles.cellTitle}>{fb.subject}</div>
                        <div className={styles.fbMeta} style={{ marginTop: 6 }}>
                          <span className={styles.typeTag}>{fb.feedbackType}</span>
                          <StarDisplay value={fb.rating} size={12} />
                          <span className={styles.cellSub} style={{ margin: 0 }}>
                            {formatRelativeTime(fb.createdAt)} · {replyCount} repl{replyCount === 1 ? 'y' : 'ies'}
                          </span>
                        </div>
                      </div>
                      <div className={styles.fbMeta}>
                        <StatusBadge status={fb.status} label={humanize(fb.status)} />
                        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>
                    {open && (
                      <div className={styles.fbBody}>
                        {fb.categoryId && (
                          <p className={styles.hint}>
                            Category: {categoryMap[fb.categoryId] || `#${fb.categoryId}`}
                          </p>
                        )}
                        <h4 className={styles.sectionTitle}>Conversation</h4>
                        <FeedbackThread feedback={fb} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
