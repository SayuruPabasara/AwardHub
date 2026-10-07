// FACTORY PATTERN (Creational) — Voting Management UI.
// Lecture Part II: hides creation details; client depends on factory, not concrete classes.
// Centralises the ongoing/upcoming/ended card variations previously scattered in if-else.

import type { Voting } from '../types'

export type VotingSection = 'ongoing' | 'upcoming' | 'ended'

export interface VotingCardModel {
  badgeText: string
  badgeKind: 'live' | 'upcoming' | 'ended'
  showProgress: boolean
  showVoteCta: boolean
}

function daysUntil(d: string | null): number {
  if (!d) return 0
  return Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 86400000))
}

export class VotingCardFactory {
  static create(v: Voting, section: VotingSection): VotingCardModel {
    if (section === 'ongoing') {
      return { badgeText: 'Live', badgeKind: 'live', showProgress: true, showVoteCta: true }
    }
    if (section === 'upcoming') {
      const days = daysUntil(v.votingStart)
      return {
        badgeText: v.status === 'collecting' ? 'Nominations open' : `Opens in ${days}d`,
        badgeKind: 'upcoming',
        showProgress: false,
        showVoteCta: false,
      }
    }
    return {
      badgeText: v.status === 'judging' ? 'Judging' : 'Ended',
      badgeKind: 'ended',
      showProgress: false,
      showVoteCta: false,
    }
  }
}
