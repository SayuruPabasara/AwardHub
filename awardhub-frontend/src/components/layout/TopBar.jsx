import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Menu,
  Bell,
  LogOut,
  User,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../ui/ThemeToggle';
import StatusBadge from '../ui/StatusBadge';
import styles from './TopBar.module.css';

export default function TopBar({ onToggleSidebar, isSidebarCollapsed }) {
  const { user, logout, getRoleDisplay } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = (user?.username || user?.email || 'U')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          className={styles.menuBtn}
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
        >
          <Menu size={20} />
        </button>
        <div className={styles.brand} onClick={() => navigate('/')}>
          <div className={styles.brandIcon}>
            <Award size={22} />
          </div>
          <span className={styles.brandName}>AwardHub</span>
        </div>
      </div>

      <div className={styles.right}>
        {user?.role && (
          <div className={styles.roleWrapper}>
            <StatusBadge status={user.role} label={getRoleDisplay()} size="sm" />
          </div>
        )}

        <ThemeToggle />

        {user ? (
          <div className={styles.profileMenu} ref={dropdownRef}>
            <button
              className={styles.profileTrigger}
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
            >
              <div className={styles.avatar}>{userInitials}</div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.username || user.email}</span>
                <span className={styles.userRole}>{getRoleDisplay()}</span>
              </div>
              <ChevronDown size={14} className={styles.dropdownArrow} />
            </button>

            {dropdownOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <p className={styles.dropdownName}>{user.username}</p>
                  <p className={styles.dropdownEmail}>{user.email}</p>
                </div>
                <div className={styles.dropdownDivider} />
                {user.role === 'NOMINEE' && (
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/nominee/profile');
                    }}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </button>
                )}
                <button
                  className={`${styles.dropdownItem} ${styles.logoutItem}`}
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className={styles.loginBtn}
            onClick={() => navigate('/login')}
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
