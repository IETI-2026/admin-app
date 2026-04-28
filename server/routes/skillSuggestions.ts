import { Router } from 'express'
import {
  addSuggestion,
  decideSuggestion,
  listSuggestions,
  type SkillSuggestionStatus,
} from '../store/skillSuggestionsStore'

export const skillSuggestionsRouter = Router()

// POST / — receives suggestion forwarded from main backend (server-to-server, no auth)
skillSuggestionsRouter.post('/', (req, res) => {
  const { name, description } = req.body as { name?: string; description?: string }

  if (!name || !description) {
    res.status(400).json({ message: 'name and description are required' })
    return
  }

  const suggestion = addSuggestion(name, description)
  res.status(201).json(suggestion)
})

// GET / — admin lists suggestions filtered by status
// Auth guard commented out for MVP — uncomment requireAdminAuth when auth is wired
// skillSuggestionsRouter.use(requireAdminAuth)
skillSuggestionsRouter.get('/', (req, res) => {
  const status = (req.query.status as SkillSuggestionStatus | 'ALL') ?? undefined
  const items = listSuggestions(status)
  res.json({ items, total: items.length })
})

// PATCH /:id/decide — accept or reject a suggestion
skillSuggestionsRouter.patch('/:id/decide', (req, res) => {
  const { id } = req.params
  const { action } = req.body as { action?: 'ACCEPT' | 'REJECT' }

  if (action !== 'ACCEPT' && action !== 'REJECT') {
    res.status(400).json({ message: 'action must be ACCEPT or REJECT' })
    return
  }

  const updated = decideSuggestion(id, action)

  if (!updated) {
    res.status(404).json({ message: 'Suggestion not found' })
    return
  }

  res.json(updated)
})
