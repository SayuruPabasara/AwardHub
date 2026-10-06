import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Layers, Vote, Clock, CheckCircle2 } from 'lucide-react';
import { categoriesApi } from '../../api/categories';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import SearchBar from '../../components/ui/SearchBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/formatters';

export default function VoterCategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.forVoter().catch(() => categoriesApi.listPublic());
      const raw = data?.data !== undefined ? data.data : data;
      const list = Array.isArray(raw) ? raw : (raw?.content || []);
      setCategories(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = categories.filter((cat) =>
    (cat.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (cat.code || '').toLowerCase().includes(search.toLowerCase()) ||
    (cat.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
            Award Categories
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Explore available award categories and view voting guidelines
          </p>
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search categories..."
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching award categories..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No Categories Available"
          description={
            search
              ? 'No award categories match your search criteria.'
              : 'There are currently no active public categories published.'
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filtered.map((cat) => (
            <Card key={cat.id} hoverable>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-soft)',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Award size={20} />
                  </div>
                  <StatusBadge
                    status={cat.isVotingOpen ? 'VOTING_OPEN' : cat.status || 'ACTIVE'}
                    label={cat.isVotingOpen ? 'Voting Open' : undefined}
                  />
                </div>

                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--accent-primary)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {cat.code || (cat.awardEventName ? cat.awardEventName : 'AWARD')}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0.25rem 0 0.5rem 0' }}>
                    {cat.name}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {cat.description || 'Award honoring excellence in this specialized category.'}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Clock size={14} />
                    {cat.votingEndDate
                      ? `Closes ${formatDate(cat.votingEndDate)}`
                      : cat.deadline
                      ? formatDate(cat.deadline)
                      : 'Open Voting'}
                  </span>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={Vote}
                    onClick={() => navigate(`/voter/vote?category=${cat.id}`)}
                  >
                    {cat.isVotingOpen ? 'Vote Now' : 'View Ballot'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
