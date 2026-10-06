import React from 'react';
import styles from './StatusBadge.module.css';

export default function StatusBadge({ status, label, size = 'sm' }) {
  const normStatus = (status || '').toUpperCase().replace(/[\s-]/g, '_');
  const displayLabel = label || status || 'Unknown';

  const badgeClass = [
    styles.badge,
    styles[normStatus] || styles.DEFAULT,
    styles[size] || styles.sm,
  ].join(' ');

  return (
    <span className={badgeClass}>
      <span className={styles.dot} />
      <span>{displayLabel}</span>
    </span>
  );
}
