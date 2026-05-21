import type { SkillSuggestion, SkillSuggestionStatus, SkillSuggestionsResponse } from '../types/skillSuggestion'
import { localClient } from './localClient'

export const getSkillSuggestions = async (
  status?: SkillSuggestionStatus,
): Promise<SkillSuggestionsResponse> => {
  const params = status && status !== 'ALL' ? { status } : {}
  const response = await localClient.get<SkillSuggestionsResponse>('/admin-api/skill-suggestions', {
    params,
  })
  return response.data
}

export const decideSkillSuggestion = async (
  id: string,
  action: 'ACCEPT' | 'REJECT',
): Promise<SkillSuggestion> => {
  const response = await localClient.patch<SkillSuggestion>(
    `/admin-api/skill-suggestions/${id}/decide`,
    { action },
  )
  return response.data
}
