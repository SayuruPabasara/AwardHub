import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Vote,
  History,
  Trophy,
  FileText,
  UserCheck,
  Send,
  Layers,
  Users,
  BarChart3,
  ShieldCheck,
  ClipboardCheck,
  Sliders,
  Award,
  Settings,
  Activity,
  FileCheck,
  MessageSquare,
  Inbox,
  FileBarChart,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './Sidebar.module.css';

export default function Sidebar({ collapsed }) {
  const { user } = useAuth();
  const role = user?.role || 'VOTER';

  const navItemsByRole = {
    VOTER: [
      { path: '/voter/categories', label: 'Categories', icon: Layers },
      { path: '/voter/vote', label: 'Cast Votes', icon: Vote },
      { path: '/voter/history', label: 'My Votes', icon: History },
      { path: '/voter/results', label: 'Results', icon: Trophy },
      { path: '/reports', label: 'Reports', icon: FileBarChart },
      { path: '/feedback', label: 'Feedback', icon: MessageSquare },
    ],
    NOMINEE: [
      { path: '/nominee/nominations', label: 'My Nominations', icon: FileText },
      { path: '/nominee/submit', label: 'New Nomination', icon: Send },
      { path: '/nominee/profile', label: 'My Profile', icon: UserCheck },
      { path: '/nominee/feed', label: 'Ceremony Feed', icon: Award },
      { path: '/reports', label: 'Reports', icon: FileBarChart },
      { path: '/feedback', label: 'Feedback', icon: MessageSquare },
    ],
    ORGANIZER: [
      { path: '/organizer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/organizer/categories', label: 'Categories', icon: Layers },
      { path: '/organizer/nominations', label: 'Nominations', icon: FileText },
      { path: '/organizer/judges', label: 'Judge Assignments', icon: ClipboardCheck },
      { path: '/organizer/votes', label: 'Live Votes', icon: Vote },
      { path: '/organizer/results', label: 'Results & Publication', icon: Trophy },
      { path: '/organizer/reports', label: 'Reports & Analytics', icon: BarChart3 },
      { path: '/organizer/feedback', label: 'Feedback Inbox', icon: Inbox },
      { path: '/organizer/audit', label: 'Audit Trail', icon: ShieldCheck },
      { path: '/feedback', label: 'Send Feedback', icon: MessageSquare },
    ],
    JUDGE: [
      { path: '/judge/worklist', label: 'Evaluation Worklist', icon: ClipboardCheck },
      { path: '/judge/scoring', label: 'Score Nominee', icon: Sliders },
      { path: '/judge/rankings', label: 'Rankings', icon: Trophy },
      { path: '/judge/summary', label: 'Evaluation Summary', icon: BarChart3 },
      { path: '/reports', label: 'Reports', icon: FileBarChart },
      { path: '/feedback', label: 'Feedback', icon: MessageSquare },
    ],
    ADMIN: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/admin/users', label: 'User Accounts', icon: Users },
      { path: '/admin/it', label: 'IT Console', icon: Settings },
      { path: '/admin/audit', label: 'System Audit', icon: ShieldCheck },
      { path: '/admin/health', label: 'System Health', icon: Activity },
      { path: '/organizer/reports', label: 'Reports & Analytics', icon: BarChart3 },
      { path: '/organizer/feedback', label: 'Feedback Inbox', icon: Inbox },
    ],
  };

  const navItems = navItemsByRole[role] || navItemsByRole.VOTER;

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.navGroup}>
        <span className={styles.groupTitle}>{collapsed ? '•' : 'NAVIGATION'}</span>
        <nav className={styles.navList}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} className={styles.itemIcon} />
                {!collapsed && <span className={styles.itemLabel}>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {!collapsed && (
        <div className={styles.footerNote}>
          <div className={styles.roleTag}>
            <Award size={14} />
            <span>Role: {role}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
