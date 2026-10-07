// STRATEGY PATTERN (Behavioral) — Voting Management UI.
// Lecture Part II: "family of algorithms, interchangeable at runtime" (Sorting example).
// Each sort lives in its own class; VotingsListPage picks one at runtime via `sortVotingList`.

import type { Voting } from '../types'

export interface VotingSortStrategy {
  key: 'ending-soon' | 'most-votes' | 'most-nominees' | 'name'
  label: string
  sort(list: Voting[]): Voting[]
}

class EndingSoonStrategy implements VotingSortStrategy {
  key = 'ending-soon' as const
  label = 'Sort: Ending soon'
  sort(list: Voting[]) {
    return [...list].sort((a, b) => {
      const da = a.votingEnd ? new Date(a.votingEnd).getTime() : Infinity
      const db = b.votingEnd ? new Date(b.votingEnd).getTime() : Infinity
      return da - db
    })
  }
}

class MostVotesStrategy implements VotingSortStrategy {
  key = 'most-votes' as const
  label = 'Sort: Most votes'
  sort(list: Voting[]) {
    return [...list].sort((a, b) => b.voteCount - a.voteCount)
  }
}

class MostNomineesStrategy implements VotingSortStrategy {
  key = 'most-nominees' as const
  label = 'Sort: Most nominees'
  sort(list: Voting[]) {
    return [...list].sort((a, b) => b.approvedNomineeCount - a.approvedNomineeCount)
  }
}

class NameStrategy implements VotingSortStrategy {
  key = 'name' as const
  label = 'Sort: Name (A–Z)'
  sort(list: Voting[]) {
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
  }
}

// CONTEXT + FACTORY: resolves the strategy by key at runtime.
export const VOTING_SORT_STRATEGIES: Record<VotingSortStrategy['key'], VotingSortStrategy> = {
  'ending-soon': new EndingSoonStrategy(),
  'most-votes': new MostVotesStrategy(),
  'most-nominees': new MostNomineesStrategy(),
  'name': new NameStrategy(),
}

export type VotingSortKey = keyof typeof VOTING_SORT_STRATEGIES

export function sortVotingList(list: Voting[], key: VotingSortKey): Voting[] {
  return (VOTING_SORT_STRATEGIES[key] ?? VOTING_SORT_STRATEGIES['ending-soon']).sort(list)
}
