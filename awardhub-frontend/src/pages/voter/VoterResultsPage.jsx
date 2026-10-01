import React, { useState, useEffect } from 'react';
import { Trophy, BarChart2, Medal } from 'lucide-react';
import { categoriesApi } from '../../api/categories';
import { evaluationApi } from '../../api/evaluation';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import VoteDistributionChart from '../../components/charts/VoteDistributionChart';

export default function VoterResultsPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCatId) {
      loadResults(selectedCatId);
    }
  }, [selectedCatId]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.listPublic();
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

  const loadResults = async (catId) => {
    setLoadingResults(true);
    try {
      const data = await evaluationApi.publishedResults(catId).catch(() => evaluationApi.latestResults(catId));
      const list = data?.entries || (Array.isArray(data) ? data : []);
      setResults(list);
    } catch (err) {
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  const activeCategory = categories.find((c) => c.id === selectedCatId);

  const chartData = results.map((r) => ({
    name: r.nomineeName || `Candidate #${r.nominationId}`,
    votes: r.voteCount !== undefined ? Number(r.voteCount) : (Number(r.finalScore) || 0),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          Public Award Leaderboards
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Real-time tallies and official winner rankings computed from the database
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Querying award categories from database..." />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No Categories Configured"
          description="There are currently no active award categories in the database."
        />
      ) : (
        <>
          {/* Category selection tabs */}
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
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Trophy size={16} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {loadingResults ? (
            <LoadingSpinner message="Calculating rankings and vote counts from database..." />
          ) : results.length === 0 ? (
            <Card>
              <EmptyState
                icon={BarChart2}
                title="Tally In Progress"
                description={`No official results or vote tallies recorded in the database yet for ${
                  activeCategory?.name || 'this category'
                }.`}
              />
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Podium / Top 3 display */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {results.slice(0, 3).map((item, idx) => {
                  const rankColors = ['#f59e0b', '#94a3b8', '#b45309'];
                  const rankLabels = ['1st Place Winner', '2nd Place Finalist', '3rd Place Finalist'];
                  return (
                    <Card key={item.nominationId || idx} hoverable>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                        }}
                      >
                        <div
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            background: rankColors[idx] ? `${rankColors[idx]}20` : 'var(--accent-soft)',
                            color: rankColors[idx] || 'var(--accent-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Medal size={28} />
                        </div>
                        <div>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: rankColors[idx] || 'var(--text-muted)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {rankLabels[idx]}
                          </span>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0.15rem 0' }}>
                            {item.nomineeName || `Candidate #${item.nominationId}`}
                          </h3>
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {item.voteCount !== undefined
                              ? `${item.voteCount} Verified Ballots`
                              : `Final Score: ${item.finalScore != null ? Number(item.finalScore).toFixed(2) : 0}`}
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Chart visualization */}
              <Card title="Vote Distribution Breakdown">
                <VoteDistributionChart data={chartData} />
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
