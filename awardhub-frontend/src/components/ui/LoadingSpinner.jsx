import React from 'react';
import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ size = 'md', message = '' }) {
  return (
    <div className={styles.container}>
      <div className={`${styles.spinner} ${styles[size] || styles.md}`} />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
