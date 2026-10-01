import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Vote, CheckCircle, Award, AlertCircle, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesApi } from '../../api/categories';
import { votesApi } from '../../api/votes';
import { evaluationApi } from '../../api/evaluation';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function VoterVotingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedCatId = searchParams.get('category');

  const [categories, setCategories] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCatId) {
      loadCandidates(selectedCatId);
    } else {
      setCandidates([]);
      setSelectedCandidate(null);
    }
  }, [selectedCatId]);

  const loadCategories = async () => {
    setLoadingCats(true);
    try {
      const data = await categoriesApi.listPublic();
      const list = Array.isArray(data) ? data : [];
      setCategories(list);
      if (!selectedCatId && list.length > 0) {
        setSearchParams({ category: list[0].id });
      }
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoadingCats(false);
    }
  };

  const loadCandidates = async (catId) => {
    setLoadingCandidates(true);
    try {
      const data = await evaluationApi.publicResults(catId);
      const list = Array.isArray(data)
        ? data.map((item) => ({
            id: item.nominationId || item.id,
            nomineeName: item.nomineeName || item.candidateName || 'Nominee',
            description: item.summary || item.nominationTitle || 'Approved Nominee Candidate',
            organization: item.organization || '',
          }))
        : [];
      setCandidates(list);
    } catch (err) {
      setCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleCastVote = async () => {
    if (!selectedCatId || !selectedCandidate) return;
    setSubmitting(true);
    try {
      await votesApi.cast(selectedCatId, {
        nominationId: selectedCandidate.id,
      });
      toast.success('Vote successfully cast!');
      setConfirmModalOpen(false);
      navigate('/voter/history');
    } catch (err) {
      toast.error(err.message || 'Failed to submit vote. You may have already voted.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCats) {
    return <LoadingSpinner message="Loading voting portal..." />;
  }

  const activeCategory = categories.find((c) => String(c.id) === String(selectedCatId));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Cast Your Vote</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Select an award category, review certified candidates, and submit your ballot
        </p>
      </div>

      {/* Category selector chips */}
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {categories.map((cat) => {
          const isSelected = String(cat.id) === String(selectedCatId);
          return (
            <button
              key={cat.id}
              onClick={() => setSearchParams({ category: cat.id })}
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
              <Award size={16} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Category Details */}
      {activeCategory && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--accent-primary)',
                }}
              >
                ACTIVE CATEGORY
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0.25rem 0 0.5rem 0' }}>
                {activeCategory.name}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                {activeCategory.description || 'Cast your ballot for the nominee of your choice.'}
              </p>
            </div>
            {selectedCandidate && (
              <Button
                variant="primary"
                size="md"
                icon={Vote}
                onClick={() => setConfirmModalOpen(true)}
              >
                Submit Ballot
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Candidates List */}
      {loadingCandidates ? (
        <LoadingSpinner message="Fetching candidates..." />
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={Vote}
          title="No Nominees Listed"
          description="There are currently no approved nominees available for public voting in this category yet."
        />
      ) : (
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            Certified Candidates ({candidates.length})
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {candidates.map((cand) => {
              const isChosen = selectedCandidate?.id === cand.id;
              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedCandidate(cand)}
                  style={{
                    background: 'var(--bg-card)',
                    border: isChosen
                      ? '2px solid var(--accent-primary)'
                      : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all var(--transition-fast)',
                    boxShadow: isChosen ? 'var(--shadow-glow)' : 'var(--shadow-xs)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: isChosen ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                        color: isChosen ? '#fff' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}
                    >
                      {cand.nomineeName.slice(0, 2).toUpperCase()}
                    </div>
                    {isChosen && (
                      <span
                        style={{
                          color: 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                        }}
                      >
                        <CheckCircle size={18} /> Selected
                      </span>
                    )}
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>
                    {cand.nomineeName}
                  </h4>
                  {cand.organization && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {cand.organization}
                    </span>
                  )}
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      marginTop: '0.75rem',
                      marginBottom: 0,
                    }}
                  >
                    {cand.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleCastVote}
        title="Confirm Your Vote"
        message={`Are you sure you want to cast your ballot for "${selectedCandidate?.nomineeName}" in ${activeCategory?.name}? Your vote will be cryptographically recorded.`}
        confirmText="Confirm Vote"
        variant="primary"
        loading={submitting}
      />
    </div>
  );
}
