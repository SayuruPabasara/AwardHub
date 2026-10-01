import React from 'react';
import styles from './EmptyState.module.css';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title = 'No items found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
}) {
  return (
    <div className={styles.emptyContainer}>
      {Icon && (
        <div className={styles.iconCircle}>
          <Icon size={28} />
        </div>
      )}
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction} className={styles.btn}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
