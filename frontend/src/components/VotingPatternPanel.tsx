// UI panel proving the patterns in use (for demo / marking).
// Strategy: switch sort algorithm at runtime. Observer: live subscriber count.

import { VOTING_SORT_STRATEGIES, type VotingSortKey } from '../patterns/votingSortStrategy'
import { votingStore } from '../patterns/votingObserver'
import { useEffect, useState } from 'react'

interface Props {
  sort: VotingSortKey
  onSortChange: (k: VotingSortKey) => void
}

export function VotingPatternPanel({ sort, onSortChange }: Props) {
  const [subs, setSubs] = useState(votingStore.observerCount())
  useEffect(() => {
    const update = () => setSubs(votingStore.observerCount())
    const unsub = votingStore.subscribe(update)
    return unsub
  }, [])

  return (
    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.75rem', color: 'var(--fg-muted)', background: 'var(--surface)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius)', padding: '0.6rem 0.9rem', marginBottom: '1rem' }}>
      <span title="Strategy: interchangeable sort algorithms">🧩 Strategy: sort = <strong>{VOTING_SORT_STRATEGIES[sort].label}</strong></span>
      <select value={sort} onChange={e => onSortChange(e.target.value as VotingSortKey)} style={{ width: 'auto', minWidth: 0, padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
        {(Object.keys(VOTING_SORT_STRATEGIES) as VotingSortKey[]).map(k => (
          <option key={k} value={k}>{VOTING_SORT_STRATEGIES[k].label}</option>
        ))}
      </select>
      <span title="Factory creates the card, Decorator adds badge/progress">🏭 Factory + 🎨 Decorator: card built per section</span>
      <span title="Observer + Singleton shared store">👁 Observer ({subs} subs) · Singleton store</span>
    </div>
  )
}
