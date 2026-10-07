import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import type { Voting } from '../types'
import { GlassNav } from '../components/GlassNav'
import { VotingPatternPanel } from '../components/VotingPatternPanel'
import { VOTING_SORT_STRATEGIES, sortVotingList, type VotingSortKey } from '../patterns/votingSortStrategy'
import { VotingCardFactory } from '../patterns/votingCardFactory'
import { baseCard, withLivePulse, withProgressBar } from '../patterns/votingDecorator'
import { votingStore } from '../patterns/votingObserver'
import type { User } from '../types'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1767561070418-cbb62b952a6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600'

export type VotingSection = 'ongoing' | 'upcoming' | 'ended'

interface Props {
  section: VotingSection
  user: User | null
  onOpenVoting: (voting: Voting) => void
  onOpenVote: (voting: Voting) => void
  onHome: () => void
  onLogin: () => void
  theme: 'dark' | 'light'
  onThemeToggle: () => void
  onNavigate: (dest: 'dashboard' | 'history' | 'nominate' | 'settings') => void
  onLogout: () => void
  onJudge?: () => void
  onHeadOrganizer?: () => void
  onOrganizingTeam?: () => void
}

const SECTION_META: Record<VotingSection, { eyebrow: string; title: string; blurb: string }> = {
  ongoing: { eyebrow: 'Live Now', title: 'Ongoing Votings', blurb: 'Categories currently open for voting. Pick a category to see the nominees and cast your NIC-verified vote.' },
  upcoming: { eyebrow: 'Coming Soon', title: 'Upcoming Votings', blurb: 'Categories on the horizon — review eligibility and nominate yourself before the window opens.' },
  ended: { eyebrow: 'Hall of Fame', title: 'Ended Votings', blurb: 'Closed categories and their final results, winners, and total participation.' },
}

function daysUntil(d: string | null) {
  if (!d) return 0
  return Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 86400000))
}

export function VotingsListPage({ section, user, onOpenVoting, onOpenVote, onHome, onLogin, theme, onThemeToggle, onNavigate, onLogout, onJudge, onHeadOrganizer, onOrganizingTeam }: Props) {
  const [votings, setVotings] = useState<Voting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  // STRATEGY pattern: interchangeable sort algorithms (see patterns/votingSortStrategy.ts)
  const [sort, setSort] = useState<VotingSortKey>('ending-soon')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.votings()
      .then(list => { if (!cancelled) { setVotings(list); votingStore.setVotings(list) } })
      .catch(() => { if (!cancelled) setError('Could not load votings — make sure the backend is running.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const meta = SECTION_META[section]

  const filtered = useMemo(() => {
    let list: Voting[] = votings.filter(v => {
      if (section === 'ongoing') return v.status === 'voting'
      if (section === 'upcoming') return v.status === 'upcoming' || v.status === 'collecting'
      return v.status === 'ended' || v.status === 'judging'
    })
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(v =>
        v.name.toLowerCase().includes(q) ||
        (v.description ?? '').toLowerCase().includes(q) ||
        (v.eligibility ?? '').toLowerCase().includes(q),
      )
    }
    const sorted = sortVotingList(list, sort)
    return sorted
  }, [votings, section, query, sort])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>
      <GlassNav user={user} title={meta.eyebrow} onHome={onHome} onLogin={onLogin} theme={theme} onThemeToggle={onThemeToggle} onNavigate={onNavigate} onLogout={onLogout} onJudge={onJudge} onHeadOrganizer={onHeadOrganizer} onOrganizingTeam={onOrganizingTeam} />

      <section style={{ padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1.25rem, 4vw, 3rem)', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.4rem' }}>{meta.eyebrow}</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', margin: '0 0 0.5rem' }}>{meta.title}</h1>
          <p style={{ color: 'var(--fg-muted)', fontSize: '0.9rem', margin: 0, maxWidth: 620, lineHeight: 1.6 }}>{meta.blurb}</p>
        </div>

        {/* Design-patterns strip: Strategy switcher + Factory/Decorator/Observer proof */}
        <VotingPatternPanel sort={sort} onSortChange={setSort} />

        {/* Search + sort bar */}
        <div
          style={{
            display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center',
            background: 'var(--surface)', backdropFilter: 'var(--blur)', WebkitBackdropFilter: 'var(--blur)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.85rem 1rem', boxShadow: 'var(--shadow)',
          }}
        >
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 220 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, description, or eligibility…"
              style={{ paddingLeft: '2.2rem' }}
            />
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)', fontSize: '0.85rem', pointerEvents: 'none' }}>🔍</span>
          </div>
          <select value={sort} onChange={e => setSort(e.target.value as VotingSortKey)} style={{ width: 'auto', minWidth: 180 }}>
            {(Object.keys(VOTING_SORT_STRATEGIES) as VotingSortKey[]).map(k => (
              <option key={k} value={k}>{VOTING_SORT_STRATEGIES[k].label}</option>
            ))}
          </select>
          <span style={{ fontSize: '0.78rem', color: 'var(--fg-muted)', whiteSpace: 'nowrap' }}>
            {loading ? 'Loading…' : `${filtered.length} ${filtered.length === 1 ? 'category' : 'categories'}`}
          </span>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'var(--danger-dim)', border: '1px solid var(--danger)', borderRadius: 'var(--radius)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            ⚠ {error}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--fg-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              {query ? `No categories match “${query}”.` : section === 'ongoing' ? 'No votings are currently live. Check back soon.' : section === 'upcoming' ? 'Nothing upcoming right now.' : 'No ended votings yet.'}
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(v => {
            // FACTORY + DECORATOR: card built by VotingCardFactory, enhanced by decorators.
            const totalLiveVotes = votings.filter(x => x.status === 'voting').reduce((s, x) => s + x.voteCount, 0)
            const card = withProgressBar(withLivePulse(baseCard(VotingCardFactory.create(v, section))), v.voteCount, totalLiveVotes)
            const isOngoing = card.showVoteCta
            const days = daysUntil(section === 'ongoing' ? v.votingEnd : v.votingStart)
            const pct = card.progressPct ?? 0
            return (
              <div
                key={v.id}
                onClick={() => onOpenVoting(v)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onOpenVoting(v)}
                style={{
                  background: 'var(--surface)', backdropFilter: 'var(--blur)', WebkitBackdropFilter: 'var(--blur)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden',
                  cursor: 'pointer', boxShadow: 'var(--shadow)', transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-floating)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)' }}
              >
                <div style={{ height: 150, position: 'relative', overflow: 'hidden' }}>
                  <img src={v.imageUrl ?? FALLBACK_IMG} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                    {card.badgeKind === 'live' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', background: '#e8383855', border: '1px solid #e8383888', borderRadius: 99, color: '#ff7070', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff7070', animation: card.pulse ? 'none' : undefined }} /> {card.badgeText}
                      </span>
                    ) : card.badgeKind === 'upcoming' ? (
                      <span style={{ display: 'inline-block', padding: '0.25rem 0.6rem', background: 'var(--info-dim)', border: '1px solid var(--info)', borderRadius: 99, color: 'var(--info)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        {card.badgeText}
                      </span>
                    ) : (
                      <span style={{ display: 'inline-block', padding: '0.25rem 0.6rem', background: 'var(--surface2)', border: '1px solid var(--border-strong)', borderRadius: 99, color: 'var(--fg-muted)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        {card.badgeText}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ padding: '1.15rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: '0 0 0.4rem', lineHeight: 1.25 }}>{v.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', lineHeight: 1.55, margin: '0 0 0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {v.description ?? 'No description provided.'}
                  </p>
                  <div style={{ display: 'flex', gap: '0.9rem', fontSize: '0.78rem', color: 'var(--fg-muted)', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
                    <span>🗳 {v.voteCount.toLocaleString()} votes</span>
                    <span>👥 {v.approvedNomineeCount} nominees</span>
                    {isOngoing && <span>⏳ {days}d left</span>}
                  </div>
                  {isOngoing && (
                    <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 99, overflow: 'hidden', marginBottom: '0.9rem' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(to right, var(--primary), var(--gradient-accent))', borderRadius: 99 }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button
                      onClick={e => { e.stopPropagation(); onOpenVoting(v) }}
                      style={{ flex: 1, padding: '0.5rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 99, color: 'var(--fg)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      View Details
                    </button>
                    {isOngoing && (
                      <button
                        onClick={e => { e.stopPropagation(); user ? onOpenVote(v) : onLogin() }}
                        style={{ flex: 1, padding: '0.5rem', background: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: 99, color: 'var(--primary-fg)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        {user ? 'Vote →' : 'Sign in to vote'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
