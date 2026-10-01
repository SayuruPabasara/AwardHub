import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Server,
  Activity,
  Key,
  Database,
  ArrowRight,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import { categoriesApi } from '../../api/categories';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [usersCount, setUsersCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [usersRes, catsRes] = await Promise.allSettled([
        adminApi.listUsers(),
        categoriesApi.list(),
      ]);

      const usersList = usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)
        ? usersRes.value
        : [];
      setUsersCount(usersList.length);

      const catsList = catsRes.status === 'fulfilled' && Array.isArray(catsRes.value)
        ? catsRes.value
        : [];
      setCategoriesCount(catsList.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Querying cluster and user tables from MS SQL..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
            System Administration
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            User directory governance, role assignments, security audits, and backend health
          </p>
        </div>
        <Button variant="primary" icon={Key} onClick={() => navigate('/admin/it')}>
          IT Coordinator Console
        </Button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <StatCard
          title="Registered Accounts"
          value={usersCount}
          subtitle="Users in database"
          icon={Users}
          accent="indigo"
        />
        <StatCard
          title="Active Award Categories"
          value={categoriesCount}
          subtitle="In categories table"
          icon={Database}
          accent="purple"
        />
        <StatCard
          title="Backend API Engine"
          value="Online"
          subtitle="Spring Boot :8080 active"
          icon={Server}
          accent="green"
        />
        <StatCard
          title="Database Engine"
          value="MS SQL"
          subtitle="Port 1433 (awardhub2)"
          icon={Activity}
          accent="blue"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <Card
          hoverable
          onClick={() => navigate('/admin/users')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-soft)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600 }}>
                User Accounts Directory
              </h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Inspect registered voters, nominees, organizers, and judges
              </p>
            </div>
            <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/admin/it')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-warning-soft)',
                color: 'var(--status-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Key size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600 }}>
                IT Password Resets
              </h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Provision credentials, unlock accounts, and issue password resets
              </p>
            </div>
            <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/admin/health')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-success-soft)',
                color: 'var(--status-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600 }}>
                System Health Diagnostics
              </h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                JVM runtime telemetry, thread status, memory pools, and DB pools
              </p>
            </div>
            <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
        </Card>
      </div>
    </div>
  );
}
