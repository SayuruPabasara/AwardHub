// OBSERVER + SINGLETON PATTERNS — Voting Management UI.
// Lecture Part I: Subject maintains observers + notifyObservers;
// Singleton: single shared instance via private constructor + getInstance().
// A tiny client-side cache: list page publishes, any component can subscribe.

import type { Voting } from '../types'

export type VotingObserver = (votings: Voting[]) => void

class VotingStore {
  private static instance: VotingStore | null = null
  private observers: VotingObserver[] = []
  private votings: Voting[] = []

  private constructor() {}

  static getInstance(): VotingStore {
    if (!VotingStore.instance) VotingStore.instance = new VotingStore()
    return VotingStore.instance
  }

  subscribe(o: VotingObserver): () => void {
    this.observers.push(o)
    o(this.votings)
    return () => this.unsubscribe(o)
  }

  unsubscribe(o: VotingObserver) {
    this.observers = this.observers.filter(x => x !== o)
  }

  setVotings(v: Voting[]) {
    this.votings = v
    this.notifyObservers()
  }

  getVotings(): Voting[] {
    return this.votings
  }

  observerCount(): number {
    return this.observers.length
  }

  private notifyObservers() {
    for (const o of this.observers) o(this.votings)
  }
}

export const votingStore = VotingStore.getInstance()
