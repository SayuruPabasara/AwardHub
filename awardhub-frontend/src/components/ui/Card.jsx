import React from 'react';
import styles from './Card.module.css';

export default function Card({
  children,
  title,
  subtitle,
  actions,
  className = '',
  hoverable = false,
  glass = false,
  padding = 'normal',
  onClick,
  ...rest
}) {
  const cardClasses = [
    styles.card,
    hoverable ? styles.hoverable : '',
    glass ? styles.glass : '',
    styles[`padding_${padding}`] || styles.padding_normal,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses} onClick={onClick} {...rest}>
      {(title || subtitle || actions) && (
        <div className={styles.header}>
          <div>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
