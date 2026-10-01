import React, { useState, useEffect } from 'react';
import { Trophy, Medal } from 'lucide-react';
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
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRankings = async (catId) => {
    try {
      const resultSet = await evaluationApi.latestResults(catId).catch(() => evaluationApi.publishedResults(catId));
      if (resultSet && Array.isArray(resultSet.entries)) {
        setRankings(resultSet.entries);
      } else if (Array.isArray(resultSet)) {
        setRankings(resultSet);
      } else {
        setRankings([]);
      }
    } catch (err) {
      setRankings([]);
    }
  };

  const columns = [
    {
      key: 'rankPosition',
      label: 'Rank',
      render: (val, row) => {
        const rank = val || row.rank;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
            {rank === 1 ? (
              <Medal size={20} style={{ color: '#f59e0b' }} />
            ) : (
              `#${rank || '—'}`
            )}
          </div>
        );
      },
      width: '80px',
    },
    {
      key: 'nomineeName',
      label: 'Nominee / Project Title',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{val || `Nomination #${row.nominationId}`}</span>
          {row.winner && (
            <span
              style={{
                display: 'inline-block',
                marginLeft: '0.5rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#f59e0b',
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '1px 6px',
                borderRadius: '4px',
              }}
            >
              WINNER
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'judgeScore',
      label: 'Judge Score',
      render: (val) => (val != null ? `${Number(val).toFixed(2)}` : '—'),
    },
    {
      key: 'voteCount',
      label: 'Public Votes',
      render: (val) => val != null ? `${val}` : '0',
    },
    {
      key: 'finalScore',
      label: 'Final Weighted Score',
      render: (val) => (
        <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '1rem' }}>
          {val != null ? `${Number(val).toFixed(2)}` : '—'}
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
          Comparative leaderboard calculated from verified panelist scores and voter tallies
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
          emptyMessage="No computed rankings found"
          emptyDescription="Rankings will appear in this category once evaluations are calculated by the award committee."
        />
      </Card>
    </div>
  );
}
