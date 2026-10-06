import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle, Clock, Shield, FileCheck } from 'lucide-react';
import { evaluationApi } from '../../api/evaluation';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function JudgeSummaryPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    avgScore: '—',
  });

  useEffect(() => {
    loadJudgeSummary();
  }, [user]);

  const loadJudgeSummary = async () => {
    setLoading(true);
    try {
      const judgeId = user?.id;
      if (!judgeId) {
        setLoading(false);
        return;
      }
      const worklist = await evaluationApi.worklist(judgeId);
      const list = Array.isArray(worklist) ? worklist : [];
      const completed = list.filter((w) => w.status === 'COMPLETED' || w.totalScore != null);
      const pending = list.length - completed.length;

      let avg = '—';
      if (completed.length > 0) {
        const sum = completed.reduce((acc, curr) => acc + (Number(curr.totalScore) || 0), 0);
        avg = (sum / completed.length).toFixed(1);
      }

      setStats({
        total: list.length,
        completed: completed.length,
        pending,
        avgScore: avg,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating evaluator statistics from database..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          Judge Performance Summary
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Real-time metrics calculated from your assigned evaluations in the database
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <StatCard
          title="Assigned Dossiers"
          value={stats.total}
          subtitle="Allocated to your panel"
          icon={FileCheck}
          accent="indigo"
        />
        <StatCard
          title="Evaluations Completed"
          value={stats.completed}
          subtitle={stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}% completed` : '0%'}
          icon={CheckCircle}
          accent="green"
        />
        <StatCard
          title="Pending Evaluations"
          value={stats.pending}
          subtitle="Action required"
          icon={Clock}
          accent="amber"
        />
        <StatCard
          title="Average Score Awarded"
          value={stats.avgScore !== '—' ? `${stats.avgScore} / 100` : '—'}
          subtitle="Across completed rubrics"
          icon={BarChart3}
          accent="purple"
        />
      </div>

      <Card title="Evaluator Code of Ethics & Transparency Pledge">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
          <p style={{ margin: 0 }}>
            As an appointed judge on the AwardHub panel, all scores submitted are cryptographically recorded in the system audit log. You have certified that:
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>No conflict of interest exists between your affiliations and any graded candidate dossiers.</li>
            <li>All criteria evaluations follow the published standard rubrics without bias or outside influence.</li>
            <li>All qualitative feedback remains confidential until the official gala announcement.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
