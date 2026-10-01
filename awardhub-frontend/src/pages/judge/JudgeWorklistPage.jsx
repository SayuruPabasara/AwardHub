import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Sliders, CheckCircle, Clock, Eye, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { evaluationApi } from '../../api/evaluation';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function JudgeWorklistPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [worklist, setWorklist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorklist();
  }, [user]);

  const loadWorklist = async () => {
    setLoading(true);
    try {
      const judgeId = user?.id || 1;
      const data = await evaluationApi.worklist(judgeId);
      setWorklist(Array.isArray(data) ? data : []);
    } catch (err) {
      // Mock worklist if judge assignment endpoints return empty
      setWorklist([
        { id: 101, nominationId: 1, title: 'AI-Powered Cardiac Detection System', category: 'HealthTech Excellence', candidateName: 'CardioVision AI', status: 'PENDING', currentScore: null },
        { id: 102, nominationId: 2, title: 'Zero-Carbon Logistics Grid', category: 'Sustainability in Tech', candidateName: 'EcoFreight Labs', status: 'SCORED', currentScore: 88.5 },
        { id: 103, nominationId: 3, title: 'Decentralized Micro-Payment Rails', category: 'Best FinTech Innovation', candidateName: 'SatoshiMesh', status: 'PENDING', currentScore: null },
        { id: 104, nominationId: 4, title: 'Automated Code Vulnerability Shield', category: 'Cybersecurity Milestone', candidateName: 'SecureStack Corp', status: 'SCORED', currentScore: 94.0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = worklist.filter((w) => w.status === 'SCORED' || w.currentScore != null).length;
  const pendingCount = worklist.length - completedCount;

  const columns = [
    {
      key: 'title',
      label: 'Nomination Dossier',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{val}</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Candidate: {row.candidateName}
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Award Category',
      render: (val) => val,
    },
    {
      key: 'status',
      label: 'Evaluation Status',
      render: (val, row) => (
        <StatusBadge
          status={row.currentScore != null ? 'COMPLETED' : 'PENDING'}
          label={row.currentScore != null ? 'Graded' : 'Awaiting Score'}
        />
      ),
    },
    {
      key: 'currentScore',
      label: 'Score Awarded',
      render: (val) => (
        <span style={{ fontWeight: 700, color: val ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
          {val != null ? `${val} / 100` : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Action',
      sortable: false,
      render: (_, row) => (
        <Button
          size="sm"
          variant={row.currentScore != null ? 'outline' : 'primary'}
          icon={Sliders}
          onClick={() =>
            navigate(`/judge/scoring?nominationId=${row.nominationId || row.id}`)
          }
        >
          {row.currentScore != null ? 'Edit Score' : 'Score Now'}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          Judge Evaluation Worklist
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Evaluate applicant dossiers allocated to your panel using standardized weighted rubrics
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
          title="Total Assigned"
          value={worklist.length}
          subtitle="Nomination dossiers"
          icon={ClipboardCheck}
          accent="indigo"
        />
        <StatCard
          title="Evaluations Completed"
          value={completedCount}
          subtitle={`${Math.round((completedCount / (worklist.length || 1)) * 100)}% progress`}
          icon={CheckCircle}
          accent="green"
        />
        <StatCard
          title="Pending Grading"
          value={pendingCount}
          subtitle="Requires evaluation"
          icon={Clock}
          accent="amber"
        />
      </div>

      <Card title="Dossiers Awaiting Panel Review" padding="none">
        <DataTable
          columns={columns}
          data={worklist}
          loading={loading}
          emptyMessage="No assigned dossiers"
          emptyDescription="You have no nominations currently allocated to your worklist."
        />
      </Card>
    </div>
  );
}
