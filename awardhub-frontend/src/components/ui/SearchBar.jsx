import React from 'react';
import { Search, X } from 'lucide-react';
import styles from './SearchBar.module.css';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  className = '',
}) {
  return (
    <div className={`${styles.searchBox} ${className}`}>
      <Search size={16} className={styles.searchIcon} />
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
