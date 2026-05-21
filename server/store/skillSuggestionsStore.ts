import { randomUUID } from 'node:crypto'

export type SkillSuggestionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface SkillSuggestion {
  id: string
  name: string
  description: string
  status: SkillSuggestionStatus
  createdAt: string
  decidedAt?: string
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

// NOTE: This store is in-memory only. Data is lost on server restart.
// The 7-day rejection window will reset on each restart.
// For production, replace with a persistent store (e.g. JSON file or database).
const suggestions = new Map<string, SkillSuggestion>()

const pruneRejected = (): void => {
  const now = Date.now()
  for (const [id, suggestion] of suggestions.entries()) {
    if (
      suggestion.status === 'REJECTED' &&
      suggestion.decidedAt &&
      now - new Date(suggestion.decidedAt).getTime() > SEVEN_DAYS_MS
    ) {
      suggestions.delete(id)
    }
  }
}

export const addSuggestion = (name: string, description: string): SkillSuggestion => {
  pruneRejected()
  const suggestion: SkillSuggestion = {
    id: randomUUID(),
    name,
    description,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  }
  suggestions.set(suggestion.id, suggestion)
  return suggestion
}

export const listSuggestions = (status?: SkillSuggestionStatus | 'ALL'): SkillSuggestion[] => {
  pruneRejected()
  const all = Array.from(suggestions.values())
  if (!status || status === 'ALL') {
    return all
  }
  return all.filter((s) => s.status === status)
}

export const decideSuggestion = (
  id: string,
  action: 'ACCEPT' | 'REJECT',
): SkillSuggestion | null => {
  const suggestion = suggestions.get(id)
  if (!suggestion) {
    return null
  }
  const updated: SkillSuggestion = {
    ...suggestion,
    status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED',
    decidedAt: new Date().toISOString(),
  }
  suggestions.set(id, updated)
  return updated
}
