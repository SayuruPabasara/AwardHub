import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Sliders, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { evaluationApi } from '../../api/evaluation';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';

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
      const judgeId = user?.id;
      if (!judgeId) {
        setWorklist([]);
        return;
      }
      const data = await evaluationApi.worklist(judgeId);
      setWorklist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load judge worklist:', err);
      setWorklist([]);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = worklist.filter((w) => w.status === 'COMPLETED' || w.totalScore != null).length;
  const pendingCount = worklist.length - completedCount;

  const columns = [
    {
      key: 'displayName',
      label: 'Nomination Candidate',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{val || `Candidate #${row.nominationId}`}</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Dossier Ref #{row.nominationId}
          </span>
        </div>
      ),
    },
    {
      key: 'categoryName',
      label: 'Award Category',
      render: (val, row) => val || `Category #${row.categoryId}`,
    },
    {
      key: 'status',
      label: 'Evaluation Status',
      render: (val, row) => (
        <StatusBadge
          status={val || (row.totalScore != null ? 'COMPLETED' : 'PENDING')}
          label={val || (row.totalScore != null ? 'Graded' : 'Awaiting Score')}
        />
      ),
    },
    {
      key: 'totalScore',
      label: 'Score Awarded',
      render: (val) => (
        <span style={{ fontWeight: 700, color: val != null ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
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
          variant={row.totalScore != null ? 'outline' : 'primary'}
          icon={Sliders}
          onClick={() =>
            navigate(`/judge/scoring?nominationId=${row.nominationId}&categoryId=${row.categoryId}`)
          }
        >
          {row.totalScore != null ? 'Edit Score' : 'Score Now'}
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
          subtitle={worklist.length > 0 ? `${Math.round((completedCount / worklist.length) * 100)}% progress` : '0% progress'}
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
          emptyMessage="No assigned dossiers found"
          emptyDescription="You have no nominations currently allocated to your worklist in the database."
        />
      </Card>
    </div>
  );
}
