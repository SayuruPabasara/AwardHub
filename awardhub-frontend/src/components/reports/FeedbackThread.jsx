import React from 'react';
import { Star } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import styles from './reports.module.css';

/** Read-only star display (1–5). */
export function StarDisplay({ value, size = 14 }) {
  if (!value) return null;
  return (
    <span className={styles.stars} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= value ? styles.starOn : ''}
          fill={n <= value ? 'currentColor' : 'none'}
          style={{ color: n <= value ? '#f59e0b' : 'var(--border-color)' }}
        />
      ))}
    </span>
  );
}

/** Interactive 1–5 star input. Clicking the current value clears it (rating is optional). */
export function StarInput({ value, onChange, idPrefix = 'rating' }) {
  return (
    <div className={styles.stars} role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          id={`${idPrefix}-star-${n}`}
          type="button"
          role="radio"
          aria-checked={value === n}
          className={`${styles.starBtn} ${n <= (value || 0) ? styles.starOn : ''}`}
          onClick={() => onChange(value === n ? null : n)}
          title={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star size={22} fill={n <= (value || 0) ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

/**
 * Renders the original feedback message + staff replies (ReplyResponseDTO[]).
 */
export default function FeedbackThread({ feedback, replies }) {
  const list = replies ?? feedback?.replies ?? [];
  return (
    <div className={styles.thread}>
      <div className={styles.bubble}>
        <div className={styles.bubbleHead}>
          <span className={styles.bubbleAuthor}>{feedback?.username || 'User'}</span>
          <span>{formatDateTime(feedback?.createdAt)}</span>
        </div>
        <p className={styles.bubbleBody}>{feedback?.message}</p>
      </div>

      {list.length === 0 ? (
        <p className={styles.hint} style={{ margin: 0 }}>No replies from the award committee yet.</p>
      ) : (
        list.map((r) => (
          <div key={r.id} className={`${styles.bubble} ${styles.bubbleStaff}`}>
            <div className={styles.bubbleHead}>
              <span className={styles.bubbleAuthor}>{r.repliedByName || `Staff #${r.repliedById}`} · Staff</span>
              <span>{formatDateTime(r.repliedAt)}</span>
            </div>
            <p className={styles.bubbleBody}>{r.message}</p>
          </div>
        ))
      )}
    </div>
  );
}
