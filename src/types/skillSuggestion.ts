export type SkillSuggestionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ALL'

export interface SkillSuggestion {
  id: string
  name: string
  description: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  decidedAt?: string
}

export interface SkillSuggestionsResponse {
  items: SkillSuggestion[]
  total: number
}
