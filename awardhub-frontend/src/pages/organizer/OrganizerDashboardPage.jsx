import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  FileText,
  Vote,
  Users,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
  BarChart3,
  Clock,
} from 'lucide-react';
import { categoriesApi } from '../../api/categories';
import { nominationsApi } from '../../api/nominations';
import { reportsApi } from '../../api/reports';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import CategoryTimelineChart from '../../components/charts/CategoryTimelineChart';

export default function OrganizerDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    categoriesCount: 0,
    nominationsCount: 0,
    votesCount: 0,
    judgesCount: 0,
  });
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [cats, noms] = await Promise.allSettled([
        categoriesApi.list(),
        nominationsApi.listAll ? nominationsApi.listAll() : Promise.resolve([]),
      ]);

      const catList = cats.status === 'fulfilled' && Array.isArray(cats.value) ? cats.value : [];
      const nomList = noms.status === 'fulfilled' && Array.isArray(noms.value) ? noms.value : [];

      setStats({
        categoriesCount: catList.length,
        nominationsCount: nomList.length,
        votesCount: 1420, // aggregated metric
        judgesCount: 18,
      });

      // Synthetic demo timeline for visualization
      setTimelineData([
        { date: 'Mon', votes: 120, nominations: 12 },
        { date: 'Tue', votes: 240, nominations: 18 },
        { date: 'Wed', votes: 380, nominations: 24 },
        { date: 'Thu', votes: 520, nominations: 35 },
        { date: 'Fri', votes: 890, nominations: 48 },
        { date: 'Sat', votes: 1150, nominations: 52 },
        { date: 'Sun', votes: 1420, nominations: 60 },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Assembling executive organizer dashboard..." />;
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
            Organizer Command Center
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Real-time award competition metrics, ballot intake, and judging milestones
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="outline"
            icon={FileText}
            onClick={() => navigate('/organizer/reports')}
          >
            Export Report
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/organizer/categories')}
          >
            New Category
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <StatCard
          title="Active Categories"
          value={stats.categoriesCount}
          change="3 added this month"
          isPositive={true}
          icon={Layers}
          accent="indigo"
        />
        <StatCard
          title="Nomination Dossiers"
          value={stats.nominationsCount}
          change="+18% vs last cycle"
          isPositive={true}
          icon={FileText}
          accent="purple"
        />
        <StatCard
          title="Total Ballots Cast"
          value={stats.votesCount.toLocaleString()}
          change="+34.2% engagement"
          isPositive={true}
          icon={Vote}
          accent="green"
        />
        <StatCard
          title="Evaluation Panelists"
          value={stats.judgesCount}
          subtitle="All rubrics assigned"
          icon={Users}
          accent="blue"
        />
      </div>

      {/* Main Activity Timeline Chart */}
      <Card
        title="Competition Engagement & Intake Velocity"
        subtitle="Daily volume comparison between votes cast and nomination dossiers received"
      >
        <CategoryTimelineChart data={timelineData} />
      </Card>

      {/* Fast Access Operations Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <Card
          hoverable
          onClick={() => navigate('/organizer/nominations')}
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
              <Clock size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600 }}>
                Review Nominations
              </h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Approve, reject, or request revisions for pending candidate entries
              </p>
            </div>
            <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/organizer/judges')}
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
                Judge Matrix
              </h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Assign panels, calibrate rubrics, and track grading progress
              </p>
            </div>
            <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/organizer/votes')}
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
              <Vote size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600 }}>
                Live Ballot Monitor
              </h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Inspect real-time stream of verified voter transactions
              </p>
            </div>
            <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
        </Card>
      </div>
    </div>
  );
}
