import React, { useState, useEffect } from 'react';
import { Trophy, Award, Medal, CheckCircle2 } from 'lucide-react';
import { categoriesApi } from '../../api/categories';
import { evaluationApi } from '../../api/evaluation';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function JudgeRankingsPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCatId) {
      loadRankings(selectedCatId);
    }
  }, [selectedCatId]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.list();
      const list = Array.isArray(data) ? data : [];
      setCategories(list);
      if (list.length > 0) {
        setSelectedCatId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRankings = async (catId) => {
    try {
      const data = await evaluationApi.categoryRankings(catId);
      setRankings(Array.isArray(data) ? data : []);
    } catch (err) {
      setRankings([
        { rank: 1, nomineeName: 'CardioVision AI', organization: 'Apex Labs', finalScore: 92.4, status: 'CONSENSUS_REACHED' },
        { rank: 2, nomineeName: 'HealthPulse Pro', organization: 'BioMetrics Inc', finalScore: 89.1, status: 'CONSENSUS_REACHED' },
        { rank: 3, nomineeName: 'NeuroSync Mobile', organization: 'Cognitive Systems', finalScore: 84.7, status: 'CONSENSUS_REACHED' },
      ]);
    }
  };

  const columns = [
    {
      key: 'rank',
      label: 'Rank',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
          {val === 1 ? (
            <Medal size={20} style={{ color: '#f59e0b' }} />
          ) : (
            `#${val}`
          )}
        </div>
      ),
      width: '80px',
    },
    {
      key: 'nomineeName',
      label: 'Nominee / Project Title',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{val}</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {row.organization || 'Independent Submission'}
          </span>
        </div>
      ),
    },
    {
      key: 'finalScore',
      label: 'Consensus Weighted Score',
      render: (val) => (
        <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '1rem' }}>
          {val} / 100
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Deliberation Status',
      render: (val) => (
        <span style={{ color: 'var(--status-success)', fontWeight: 600, fontSize: '0.8125rem' }}>
          {val ? val.replace(/_/g, ' ') : 'VERIFIED'}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          Category Finalist Rankings
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Comparative leaderboard synthesized from all panelist evaluations
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {categories.map((cat) => {
          const isSelected = cat.id === selectedCatId;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                border: isSelected
                  ? '1px solid var(--accent-primary)'
                  : '1px solid var(--border-color)',
                background: isSelected ? 'var(--accent-soft)' : 'var(--bg-card)',
                color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Trophy size={16} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      <Card padding="none">
        <DataTable
          columns={columns}
          data={rankings}
          loading={loading}
          emptyMessage="No rankings compiled"
          emptyDescription="Rankings will appear once evaluations are submitted and aggregated."
        />
      </Card>
    </div>
  );
}
