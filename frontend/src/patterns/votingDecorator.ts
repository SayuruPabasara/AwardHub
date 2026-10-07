// DECORATOR PATTERN (Structural) — Voting Management UI.
// Lecture Part II (self-study): wrap base object to add behaviour at runtime.
// Base card model -> withLivePulse -> withProgressBar, composable in any order.

import type { VotingCardModel } from './votingCardFactory'

export interface DecoratedCard extends VotingCardModel {
  pulse: boolean
  progressPct: number | null
}

export function baseCard(m: VotingCardModel): DecoratedCard {
  return { ...m, pulse: false, progressPct: null }
}

// Adds the pulsing "LIVE" dot behaviour.
export function withLivePulse(card: DecoratedCard): DecoratedCard {
  if (card.badgeKind !== 'live') return card
  return { ...card, pulse: true }
}

// Adds a vote-share progress bar computed against live totals.
export function withProgressBar(card: DecoratedCard, voteCount: number, totalLiveVotes: number): DecoratedCard {
  if (!card.showProgress) return card
  const pct = totalLiveVotes > 0 ? Math.min(100, Math.round((voteCount / totalLiveVotes) * 100)) : 0
  return { ...card, progressPct: pct }
}
