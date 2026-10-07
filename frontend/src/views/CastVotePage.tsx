import { useEffect, useMemo, useState } from 'react'
import { api, ApiError } from '../api/client'
import type { Nomination, User, Vote, Voting } from '../types'
import { GlassNav } from '../components/GlassNav'
import { Btn, Field } from '../components/UI'

interface Props {
  voting: Voting
  user: User | null
  votes: Vote[]
  onVotesChanged: () => void
  onBack: () => void
  onHome: () => void
  onLogin: () => void
  onVoteSuccess?: () => void
  theme: 'dark' | 'light'
  onThemeToggle: () => void
  onNavigate: (dest: 'dashboard' | 'history' | 'nominate' | 'settings') => void
  onLogout: () => void
  onJudge?: () => void
  onHeadOrganizer?: () => void
  onOrganizingTeam?: () => void
}

type Step = 'select' | 'verify' | 'success' | 'withdrawn'

export function CastVotePage({ voting, user, votes, onVotesChanged, onBack, onHome, onLogin, onVoteSuccess, theme, onThemeToggle, onNavigate, onLogout, onJudge, onHeadOrganizer, onOrganizingTeam }: Props) {
  const [nominees, setNominees] = useState<Nomination[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [selected, setSelected] = useState<string>(votes.find(v => v.votingId === voting.id)?.nominationId != null ? String(votes.find(v => v.votingId === voting.id)!.nominationId) : '')
  const [step, setStep] = useState<Step>('select')
  const [nic, setNic] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const existingVote = votes.find(v => v.votingId === voting.id)
  const isUpdate = !!existingVote

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.nominees(voting.id)
      .then(list => { if (!cancelled) setNominees(list) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [voting.id])

  const ranked = useMemo(() => [...nominees].sort((a, b) => b.voteCount - a.voteCount), [nominees])
  const totalVotes = nominees.reduce((s, n) => s + n.voteCount, 0)
  const selectedNominee = nominees.find(n => String(n.id) === selected)
  const daysLeft = Math.max(0, Math.ceil((new Date(voting.votingEnd ?? '').getTime() - Date.now()) / 86400000))

  async function handleCast() {
    if (!user) { setError('You must be signed in to vote.'); return }
    if (!nic || nic.length < 10) { setError('Enter your NIC number to verify identity.'); return }
    if (user.nic && nic !== user.nic) { setError('NIC does not match your registered identity.'); return }
    setError('')
    setBusy(true)
    try {
      if (isUpdate) {
        await api.changeVote(voting.id, { nic, nominationId: Number(selected) })
      } else {
        await api.castVote(voting.id, { nic, nominationId: Number(selected) })
      }
      onVotesChanged()
      setStep('success')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not cast vote.')
    } finally {
      setBusy(false)
    }
  }

  async function handleWithdraw() {
    setBusy(true)
    setError('')
    try {
      await api.withdrawVote(voting.id)
      onVotesChanged()
      setSelected('')
      setStep('withdrawn')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not withdraw vote.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>
      <GlassNav user={user} title="Cast Your Vote" onHome={onHome} onLogin={onLogin} theme={theme} onThemeToggle={onThemeToggle} onNavigate={onNavigate} onLogout={onLogout} onJudge={onJudge} onHeadOrganizer={onHeadOrganizer} onOrganizingTeam={onOrganizingTeam} />

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem clamp(1.25rem, 4vw, 3rem) 4rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
          <div>
            <button
              onClick={onBack}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', padding: 0, marginBottom: '0.6rem', fontFamily: 'var(--font-body)' }}
            >
              ← Back to {voting.name}
            </button>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.35rem' }}>
              {isUpdate ? 'Update Your Vote' : 'Cast Your Vote'}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', margin: '0 0 0.4rem' }}>{voting.name}</h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--fg-muted)' }}>
              {daysLeft > 0 ? `⏳ ${daysLeft} days remaining · closes ${voting.votingEnd ?? 'TBA'}` : 'Voting has ended'} · {nominees.length} nominees · {totalVotes.toLocaleString()} votes cast
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>Your identity</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.95rem', borderRadius: 99, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-dim)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>{user?.avatar ?? user?.name.slice(0, 2).toUpperCase() ?? '👤'}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{user?.name ?? 'Not signed in'}</span>
            </div>
          </div>
        </div>

        {/* Update notice */}
        {isUpdate && step === 'select' && (
          <div style={{ padding: '0.85rem 1.1rem', background: 'var(--info-dim)', border: '1px solid var(--info)', borderRadius: 'var(--radius)', fontSize: '0.85rem', color: 'var(--info)', marginBottom: '1.25rem' }}>
            ℹ You already voted for <strong>{existingVote.nomineeName}</strong>. Select a different nominee to change your vote, or withdraw below.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.2fr) minmax(240px, 1fr)', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── Main column ── */}
          <div>
            {step === 'select' && (
              <>
                {loading ? (
                  <p style={{ color: 'var(--fg-muted)' }}>Loading nominees…</p>
                ) : nominees.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--fg-muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                    <p style={{ margin: 0 }}>No approved nominees in this category yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {ranked.map((n, i) => {
                      const isChosen = String(n.id) === selected
                      const isMine = existingVote?.nominationId === n.id
                      const isOpen = expanded === n.id
                      const pct = totalVotes > 0 ? Math.round((n.voteCount / totalVotes) * 100) : 0
                      return (
                        <div
                          key={n.id}
                          style={{
                            background: isChosen ? 'var(--primary-dim)' : 'var(--surface)',
                            backdropFilter: 'var(--blur)', WebkitBackdropFilter: 'var(--blur)',
                            border: `1px solid ${isChosen ? 'var(--primary-border)' : 'var(--border)'}`,
                            borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden', transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ display: 'flex', gap: '1rem', padding: '1rem 1.1rem', alignItems: 'flex-start' }}>
                            <input
                              type="radio" name="nominee" value={String(n.id)} checked={isChosen}
                              onChange={() => setSelected(String(n.id))}
                              style={{ marginTop: '0.25rem', accentColor: 'var(--primary)', flexShrink: 0, width: 'auto' }}
                            />
                            {/* Neutral initials avatar — no nominee photos exist, so a stock photo would misrepresent the nominee */}
                            <div
                              aria-hidden
                              style={{
                                width: 54, height: 54, borderRadius: '50%', flexShrink: 0,
                                background: 'var(--primary-dim)', color: 'var(--primary)',
                                border: '1px solid var(--border-strong)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem',
                              }}
                            >
                              {n.nomineeName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{n.nomineeName}</span>
                                {isMine && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--success)', background: 'var(--success-dim)', border: '1px solid var(--success)', borderRadius: 99, padding: '0.1rem 0.45rem' }}>Your current vote</span>}
                                {totalVotes > 0 && <span style={{ fontSize: '0.68rem', color: 'var(--fg-muted)' }}>#{i + 1} · {pct}%</span>}
                              </div>
                              <p style={{ margin: '0.3rem 0 0', fontSize: '0.82rem', color: 'var(--fg-muted)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: isOpen ? undefined : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {n.statement ?? 'No statement provided.'}
                              </p>
                              {isOpen && (
                                <div style={{ marginTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.8rem', color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                                  {n.bio && <div><strong style={{ color: 'var(--fg)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.15rem' }}>Bio</strong>{n.bio}</div>}
                                  {n.evidence && <div><strong style={{ color: 'var(--fg)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.15rem' }}>Evidence</strong>{n.evidence}</div>}
                                  {n.portfolio && <div><strong style={{ color: 'var(--fg)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.15rem' }}>Portfolio</strong><a href={n.portfolio} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', wordBreak: 'break-all' }}>{n.portfolio}</a></div>}
                                  {n.blindCode && <div style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>Blind code: {n.blindCode} · submitted {new Date(n.submittedAt).toLocaleDateString()}</div>}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => setExpanded(isOpen ? null : n.id)}
                              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem', flexShrink: 0, fontFamily: 'var(--font-body)' }}
                            >
                              {isOpen ? 'Less ▲' : 'More ▼'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.9rem' }}>{error}</p>}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                  <Btn disabled={!selected || selected === String(existingVote?.nominationId ?? '') || busy} onClick={() => { setError(''); setStep('verify') }}>
                    {isUpdate ? 'Cast New Vote →' : 'Continue to Verify →'}
                  </Btn>
                  {isUpdate && <Btn variant="danger" disabled={busy} onClick={handleWithdraw}>{busy ? 'Withdrawing…' : 'Withdraw Vote'}</Btn>}
                </div>
              </>
            )}

            {step === 'verify' && (
              <div style={{ background: 'var(--surface)', backdropFilter: 'var(--blur-strong)', WebkitBackdropFilter: 'var(--blur-strong)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)', padding: '1.75rem', boxShadow: 'var(--shadow-floating)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', margin: '0 0 0.75rem' }}>Identity Verification</h2>
                <p style={{ color: 'var(--fg-muted)', fontSize: '0.85rem', lineHeight: 1.65, margin: '0 0 1.25rem' }}>
                  To prevent duplicate voting, confirm your NIC number. Each NIC may only cast one vote per category.
                </p>

                <div style={{ padding: '1rem', background: 'var(--surface2)', borderRadius: 'var(--radius)', borderLeft: '3px solid var(--primary)', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-muted)', fontWeight: 700, marginBottom: '0.3rem' }}>Your selection</div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{selectedNominee?.nomineeName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', marginTop: '0.15rem' }}>{voting.name}</div>
                </div>

                <Field label="NIC Number">
                  <input
                    required value={nic} onChange={e => { setNic(e.target.value); setError('') }}
                    placeholder={user?.nic ? '••••••••••••' : 'Enter your 10 or 12-digit NIC'}
                    maxLength={12}
                  />
                </Field>
                {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', margin: '0.75rem 0 0' }}>{error}</p>}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  <Btn onClick={handleCast} disabled={busy}>{busy ? 'Casting…' : isUpdate ? '✓ Update Vote' : '✓ Cast Vote'}</Btn>
                  <Btn variant="ghost" onClick={() => setStep('select')}>← Back to Nominees</Btn>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
                <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--success-dim)', border: '2px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.25rem' }}>✓</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', margin: '0 0 0.5rem' }}>{isUpdate ? 'Vote Updated!' : 'Vote Cast!'}</h2>
                <p style={{ color: 'var(--fg-muted)', fontSize: '0.9rem', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
                  Your vote for <strong style={{ color: 'var(--fg)' }}>{selectedNominee?.nomineeName}</strong> in <strong style={{ color: 'var(--fg)' }}>{voting.name}</strong> has been recorded.
                </p>
                <Btn onClick={onHome}>Back to Home</Btn>
              </div>
            )}

            {step === 'withdrawn' && (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🗑</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', margin: '0 0 0.5rem' }}>Vote Withdrawn</h2>
                <p style={{ color: 'var(--fg-muted)', fontSize: '0.9rem', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
                  Your vote has been removed. You can re-vote any time before {voting.votingEnd ?? 'the deadline'}.
                </p>
                <Btn onClick={() => setStep('select')}>Cast a New Vote</Btn>
              </div>
            )}
          </div>

          {/* ── Sidebar: live standings ── */}
          <aside style={{ position: 'sticky', top: 76 }}>
            <div style={{ background: 'var(--surface)', backdropFilter: 'var(--blur)', WebkitBackdropFilter: 'var(--blur)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.15rem', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.85rem' }}>Live Standings</div>
              {totalVotes === 0 ? (
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--fg-muted)' }}>No votes cast yet — be the first!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  {ranked.slice(0, 5).map((n, i) => {
                    const pct = Math.round((n.voteCount / totalVotes) * 100)
                    return (
                      <div key={n.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 600 }}>{i + 1}. {n.nomineeName}</span>
                          <span style={{ color: 'var(--fg-muted)' }}>{pct}%</span>
                        </div>
                        <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(to right, var(--primary), var(--gradient-accent))', borderRadius: 99 }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.9rem', paddingTop: '0.7rem', fontSize: '0.72rem', color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                🔒 NIC-verified · one vote per person per category · changeable until {voting.votingEnd ?? 'deadline'}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
