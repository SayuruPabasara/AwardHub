import React from 'react';
import styles from './StatCard.module.css';

export default function StatCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  accent = 'indigo',
  subtitle,
}) {
  return (
    <div className={`${styles.card} ${styles[accent] || styles.indigo}`}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {Icon && (
          <div className={styles.iconWrapper}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.value}>{value}</div>
        {(change !== undefined || subtitle) && (
          <div className={styles.footer}>
            {change !== undefined && (
              <span
                className={`${styles.change} ${
                  isPositive ? styles.positive : styles.negative
                }`}
              >
                {isPositive ? '↑' : '↓'} {change}
              </span>
            )}
            {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
