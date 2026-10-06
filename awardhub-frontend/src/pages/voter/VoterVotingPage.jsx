import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Vote, CheckCircle, Award, ShieldCheck, AlertCircle, Clock, Undo2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { categoriesApi } from '../../api/categories';
import { votesApi } from '../../api/votes';
import { nominationsApi } from '../../api/nominations';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate } from '../../utils/formatters';

export default function VoterVotingPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedCatId = searchParams.get('category');

  const [categories, setCategories] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [myVotes, setMyVotes] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  
  // Ballot modal state
  const [ballotModalOpen, setBallotModalOpen] = useState(false);
  const [nicInput, setNicInput] = useState('');
  const [nicError, setNicError] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('OPEN'); // 'OPEN' | 'ALL' | 'VOTED'
  const [showGuidelines, setShowGuidelines] = useState(false);

  useEffect(() => {
    loadCategoriesAndVotes();
  }, []);

  useEffect(() => {
    if (selectedCatId) {
      loadCandidates(selectedCatId);
      setSelectedCandidate(null);
    } else {
      setCandidates([]);
      setSelectedCandidate(null);
    }
  }, [selectedCatId]);

  const loadCategoriesAndVotes = async () => {
    setLoadingCats(true);
    try {
      const [catsRes, votesRes] = await Promise.allSettled([
        categoriesApi.forVoter().catch(() => categoriesApi.listPublic()),
        votesApi.mine().catch(() => []),
      ]);

      let catList = [];
      if (catsRes.status === 'fulfilled') {
        const val = catsRes.value;
        const raw = val?.data !== undefined ? val.data : val;
        catList = Array.isArray(raw) ? raw : (raw?.content || []);
      }
      setCategories(catList);

      let castVotes = [];
      if (votesRes.status === 'fulfilled') {
        castVotes = Array.isArray(votesRes.value) ? votesRes.value : [];
      }
      setMyVotes(castVotes);

      if (!selectedCatId && catList.length > 0) {
        // Automatically default to the first category where voting is currently open
        const firstOpen = catList.find((c) => c.isVotingOpen);
        const target = firstOpen || catList[0];
        setSearchParams({ category: target.id });
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
      const data = await nominationsApi.approvedForCategory(catId);
      const list = Array.isArray(data)
        ? data.map((item) => ({
            id: item.id,
            nomineeId: item.nomineeId,
            title: item.title || `Nomination #${item.id}`,
            description: item.description || 'Approved Nominee Candidate',
            supportingDocument: item.supportingDocument,
          }))
        : [];
      setCandidates(list);
    } catch (err) {
      setCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const activeCategory = categories.find((c) => String(c.id) === String(selectedCatId));
  const existingVote = myVotes.find((v) => String(v.categoryId) === String(selectedCatId));

  // Determine voting window state
  const now = new Date();
  const startDate = activeCategory?.votingStartDate ? new Date(activeCategory.votingStartDate) : null;
  const endDate = activeCategory?.votingEndDate ? new Date(activeCategory.votingEndDate) : null;
  
  const isUpcoming = startDate && now < startDate;
  const isClosed = (endDate && now > endDate) || 
    activeCategory?.status === 'ARCHIVED' || 
    activeCategory?.status === 'VOTING_CLOSED';
  const isVotingOpen = activeCategory?.isVotingOpen ?? (!isUpcoming && !isClosed);

  const handleOpenBallotModal = () => {
    if (!selectedCandidate) return;
    setNicInput(user?.nic || '');
    setNicError('');
    setBallotModalOpen(true);
  };

  const handleCastVote = async (e) => {
    e.preventDefault();
    if (!selectedCatId || !selectedCandidate) return;

    const trimmedNic = nicInput.trim();
    if (!trimmedNic) {
      setNicError('National Identity Card (NIC) is required for verification.');
      return;
    }

    setSubmitting(true);
    try {
      await votesApi.cast(selectedCatId, {
        nic: trimmedNic,
        nominationId: selectedCandidate.id,
      });
      toast.success('Ballot successfully verified and cast!');
      setBallotModalOpen(false);
      navigate('/voter/history');
    } catch (err) {
      toast.error(err.message || 'Failed to submit vote. Please verify your NIC and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawVote = async () => {
    if (!selectedCatId) return;
    setWithdrawing(true);
    try {
      await votesApi.withdraw(selectedCatId);
      toast.success('Your vote has been withdrawn.');
      const updatedVotes = await votesApi.mine().catch(() => []);
      setMyVotes(Array.isArray(updatedVotes) ? updatedVotes : []);
    } catch (err) {
      toast.error(err.message || 'Failed to withdraw vote.');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loadingCats) {
    return <LoadingSpinner message="Loading voting portal..." />;
  }

  // Filter categories according to tab
  const filteredCategories = categories.filter((cat) => {
    if (categoryFilter === 'OPEN') return cat.isVotingOpen;
    if (categoryFilter === 'VOTED') return myVotes.some((v) => String(v.categoryId) === String(cat.id));
    return true; // 'ALL'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Award Voting Portal</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Browse open categories, review certified nominees, and cast your verified ballot
        </p>
      </div>

      {/* Workflow Step Tracker */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            1
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block' }}>Choose Category</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {activeCategory ? activeCategory.name : 'Select below'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: selectedCandidate ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: selectedCandidate ? '#fff' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            2
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block' }}>Pick Approved Nominee</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {selectedCandidate ? selectedCandidate.title : 'Select a candidate'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: existingVote ? 'var(--status-success)' : 'var(--bg-tertiary)',
              color: existingVote ? '#fff' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            3
          </div>
          <div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block' }}>Ballot Status</span>
            <span style={{ fontSize: '0.75rem', color: existingVote ? 'var(--status-success)' : 'var(--text-muted)' }}>
              {existingVote ? 'Verified Vote Recorded' : 'Ready to Cast'}
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs & Chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setCategoryFilter('OPEN')}
              style={{
                border: 'none',
                background: categoryFilter === 'OPEN' ? 'var(--bg-card)' : 'transparent',
                color: categoryFilter === 'OPEN' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: categoryFilter === 'OPEN' ? 600 : 500,
                fontSize: '0.8125rem',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                boxShadow: categoryFilter === 'OPEN' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              Open for Voting ({categories.filter((c) => c.isVotingOpen).length})
            </button>
            <button
              onClick={() => setCategoryFilter('ALL')}
              style={{
                border: 'none',
                background: categoryFilter === 'ALL' ? 'var(--bg-card)' : 'transparent',
                color: categoryFilter === 'ALL' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: categoryFilter === 'ALL' ? 600 : 500,
                fontSize: '0.8125rem',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                boxShadow: categoryFilter === 'ALL' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              All Categories ({categories.length})
            </button>
            <button
              onClick={() => setCategoryFilter('VOTED')}
              style={{
                border: 'none',
                background: categoryFilter === 'VOTED' ? 'var(--bg-card)' : 'transparent',
                color: categoryFilter === 'VOTED' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: categoryFilter === 'VOTED' ? 600 : 500,
                fontSize: '0.8125rem',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                boxShadow: categoryFilter === 'VOTED' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              My Ballots ({myVotes.length})
            </button>
          </div>

          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Showing {filteredCategories.length} categories
          </span>
        </div>

        {/* Category selector chips */}
        {filteredCategories.length === 0 ? (
          <div
            style={{
              padding: '1.25rem',
              background: 'var(--bg-card)',
              border: '1px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
            }}
          >
            {categoryFilter === 'OPEN'
              ? 'No categories are currently open for public voting.'
              : categoryFilter === 'VOTED'
              ? 'You have not cast any ballots yet.'
              : 'No categories available.'}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {filteredCategories.map((cat) => {
              const isSelected = String(cat.id) === String(selectedCatId);
              const hasVotedThis = myVotes.some((v) => String(v.categoryId) === String(cat.id));
              return (
                <button
                  key={cat.id}
                  onClick={() => setSearchParams({ category: cat.id })}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1.25rem',
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
                  {hasVotedThis && (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--status-success)',
                        display: 'inline-block',
                      }}
                      title="Ballot already cast"
                    />
                  )}
                  {cat.isVotingOpen && !hasVotedThis && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.4rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: 'var(--status-success)',
                        fontWeight: 700,
                      }}
                    >
                      OPEN
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Category Details & Status Banner */}
      {activeCategory && (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--accent-primary)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Award Category
                  </span>
                  <StatusBadge 
                    status={isVotingOpen ? 'VOTING_OPEN' : isUpcoming ? 'DRAFT' : 'VOTING_CLOSED'}
                    label={isVotingOpen ? 'Voting Open' : isUpcoming ? 'Upcoming' : 'Voting Closed'}
                  />
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0.25rem 0 0.5rem 0' }}>
                  {activeCategory.name}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0, maxWidth: 800 }}>
                  {activeCategory.description || 'Cast your ballot for the nominee of your choice.'}
                </p>
                {(activeCategory.votingStartDate || activeCategory.votingEndDate) && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8125rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.5rem',
                    }}
                  >
                    <Clock size={14} />
                    <span>
                      Voting Window: {formatDate(activeCategory.votingStartDate)} &ndash; {formatDate(activeCategory.votingEndDate)}
                    </span>
                  </div>
                )}
              </div>

              {/* Action area */}
              <div>
                {existingVote ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Button
                      variant="outline"
                      size="md"
                      icon={Undo2}
                      onClick={handleWithdrawVote}
                      loading={withdrawing}
                      disabled={!isVotingOpen}
                    >
                      Withdraw Ballot
                    </Button>
                  </div>
                ) : selectedCandidate && isVotingOpen ? (
                  <Button
                    variant="primary"
                    size="md"
                    icon={Vote}
                    onClick={handleOpenBallotModal}
                  >
                    Cast Ballot for {selectedCandidate.title}
                  </Button>
                ) : null}
              </div>
            </div>

            {/* Voting rules and guidelines toggler */}
            {(activeCategory.rules || activeCategory.voterEligibility) && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowGuidelines(!showGuidelines)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  {showGuidelines ? 'Hide Voting Guidelines' : 'View Voting Guidelines & Eligibility'}
                </button>
                {showGuidelines && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.875rem',
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    {activeCategory.voterEligibility && (
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Voter Eligibility: </strong>
                        {activeCategory.voterEligibility}
                      </div>
                    )}
                    {activeCategory.rules && (
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Rules: </strong>
                        {activeCategory.rules}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Existing vote notification banner */}
            {existingVote && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--accent-soft)',
                  border: '1px solid var(--accent-primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.875rem 1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle size={20} color="var(--accent-primary)" />
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block' }}>
                      You have already cast a verified ballot in this category
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Voted for: <strong>{existingVote.nomineeTitle || `Nomination #${existingVote.nominationId}`}</strong>
                    </span>
                  </div>
                </div>
                {isVotingOpen && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    To change your vote, withdraw your current ballot first.
                  </span>
                )}
              </div>
            )}

            {/* Timeline warning banner */}
            {!isVotingOpen && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.875rem 1.25rem',
                }}
              >
                <AlertCircle size={20} color="var(--text-muted)" />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {isUpcoming
                    ? 'Voting has not opened yet for this award category.'
                    : 'Voting has closed for this award category. Ballots can no longer be cast or modified.'}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Candidates List */}
      {loadingCandidates ? (
        <LoadingSpinner message="Fetching certified candidates..." />
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={Vote}
          title="No Approved Nominees"
          description="There are currently no approved nominees available for voting in this category."
        />
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
              Approved Candidates ({candidates.length})
            </h3>
            {existingVote && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Ballot locked &mdash; withdraw current vote to re-cast
              </span>
            )}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {candidates.map((cand) => {
              const isChosen = selectedCandidate?.id === cand.id;
              const isVotedForThis = existingVote && existingVote.nominationId === cand.id;
              const canSelect = isVotingOpen && !existingVote;

              return (
                <div
                  key={cand.id}
                  onClick={() => canSelect && setSelectedCandidate(cand)}
                  style={{
                    background: 'var(--bg-card)',
                    border: isVotedForThis
                      ? '2px solid var(--status-success)'
                      : isChosen
                      ? '2px solid var(--accent-primary)'
                      : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    cursor: canSelect ? 'pointer' : 'default',
                    opacity: !canSelect && !isVotedForThis ? 0.75 : 1,
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
                        background: isVotedForThis
                          ? 'var(--status-success)'
                          : isChosen
                          ? 'var(--accent-primary)'
                          : 'var(--bg-tertiary)',
                        color: isVotedForThis || isChosen ? '#fff' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}
                    >
                      {(cand.title || 'N').slice(0, 2).toUpperCase()}
                    </div>
                    {isVotedForThis ? (
                      <span
                        style={{
                          color: 'var(--status-success)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                        }}
                      >
                        <CheckCircle size={18} /> Cast Ballot
                      </span>
                    ) : isChosen ? (
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
                    ) : null}
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>
                    {cand.title}
                  </h4>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Nomination ID: #{cand.id}
                  </span>
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

      {/* NIC Verification & Ballot Confirmation Modal */}
      <Modal
        isOpen={ballotModalOpen}
        onClose={() => setBallotModalOpen(false)}
        title="Confirm Ballot & Identity Verification"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setBallotModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={ShieldCheck}
              onClick={handleCastVote}
              loading={submitting}
            >
              Verify & Cast Ballot
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              padding: '1rem',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Selected Candidate
            </span>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0.25rem 0' }}>
              {selectedCandidate?.title}
            </h4>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Category: {activeCategory?.name}
            </span>
          </div>

          <div>
            <label
              htmlFor="voter-nic"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '0.35rem',
              }}
            >
              National Identity Card (NIC) Verification <span style={{ color: 'var(--status-error)' }}>*</span>
            </label>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>
              To ensure voting integrity and prevent duplicate voting, enter the NIC registered to your account.
            </p>
            <input
              id="voter-nic"
              type="text"
              value={nicInput}
              onChange={(e) => {
                setNicInput(e.target.value);
                if (nicError) setNicError('');
              }}
              placeholder="e.g. 199012345678 or 123456789V"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: nicError ? '1px solid var(--status-error)' : '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
            {nicError && (
              <span style={{ display: 'block', color: 'var(--status-error)', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                {nicError}
              </span>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              alignItems: 'flex-start',
              padding: '0.75rem',
              background: 'var(--accent-soft)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <ShieldCheck size={18} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>
              Your ballot is cryptographically registered to your account. You can withdraw or re-cast your vote anytime before the voting period closes.
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
}

