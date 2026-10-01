import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.wrapper}>
      <TopBar
        onToggleSidebar={() => setCollapsed((prev) => !prev)}
        isSidebarCollapsed={collapsed}
      />
      <div className={styles.body}>
        <Sidebar collapsed={collapsed} />
        <main className={styles.main}>
          <div className={styles.content}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
