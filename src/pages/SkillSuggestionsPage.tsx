import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getErrorMessage } from '../api/error'
import { decideSkillSuggestion, getSkillSuggestions } from '../api/skillSuggestionsApi'
import { StatusPill } from '../components/StatusPill'
import { formatDateTime } from '../lib/format'
import type { SkillSuggestionStatus } from '../types/skillSuggestion'

const TABS: { label: string; value: SkillSuggestionStatus }[] = [
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Aceptadas', value: 'ACCEPTED' },
  { label: 'Rechazadas (7 días)', value: 'REJECTED' },
]

export const SkillSuggestionsPage = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<SkillSuggestionStatus>('PENDING')
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const suggestionsQuery = useQuery({
    queryKey: ['skill-suggestions', activeTab],
    queryFn: () => getSkillSuggestions(activeTab),
  })

  const decideMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'ACCEPT' | 'REJECT' }) =>
      decideSkillSuggestion(id, action),
    onSuccess: (_, variables) => {
      const msg =
        variables.action === 'ACCEPT'
          ? 'Habilidad aceptada correctamente.'
          : 'Habilidad rechazada. Permanecerá visible 7 días.'
      setSuccessMessage(msg)
      setActionError(null)
      void queryClient.invalidateQueries({ queryKey: ['skill-suggestions'] })
      setTimeout(() => setSuccessMessage(null), 4000)
    },
    onError: (error) => {
      setActionError(getErrorMessage(error))
      setSuccessMessage(null)
    },
  })

  const items = suggestionsQuery.data?.items ?? []

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <h2>Sugerencias de habilidades</h2>
          <p>Revisa las habilidades propuestas por los técnicos y acepta o rechaza cada una.</p>
        </div>
      </header>

      <div className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={activeTab === tab.value ? 'tab-button tab-button-active' : 'tab-button'}
            onClick={() => {
              setActiveTab(tab.value)
              setActionError(null)
              setSuccessMessage(null)
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'REJECTED' ? (
        <p className="hint-text">
          Las sugerencias rechazadas se eliminan automáticamente después de 7 días.
        </p>
      ) : null}

      {successMessage ? (
        <article className="state-card success-state">{successMessage}</article>
      ) : null}
      {actionError ? <article className="state-card error-state">{actionError}</article> : null}

      {suggestionsQuery.isLoading ? (
        <article className="state-card">Cargando sugerencias...</article>
      ) : null}

      {suggestionsQuery.isError ? (
        <article className="state-card error-state">
          {getErrorMessage(suggestionsQuery.error)}
        </article>
      ) : null}

      {!suggestionsQuery.isLoading && !suggestionsQuery.isError && items.length === 0 ? (
        <article className="state-card">No hay sugerencias para este filtro.</article>
      ) : null}

      {!suggestionsQuery.isLoading && !suggestionsQuery.isError && items.length > 0 ? (
        <div className="table-wrapper">
          <table className="review-table">
            <thead>
              <tr>
                <th>Nombre de habilidad</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Recibida</th>
                <th>Decisión</th>
                {activeTab === 'PENDING' ? <th>Acciones</th> : null}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>{item.description}</td>
                  <td>
                    <StatusPill value={item.status} />
                  </td>
                  <td>{formatDateTime(item.createdAt)}</td>
                  <td>{item.decidedAt ? formatDateTime(item.decidedAt) : '-'}</td>
                  {activeTab === 'PENDING' ? (
                    <td>
                      <div className="document-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={decideMutation.isPending}
                          onClick={() =>
                            decideMutation.mutate({ id: item.id, action: 'ACCEPT' })
                          }
                        >
                          Aceptar
                        </button>
                        <button
                          type="button"
                          className="danger-button"
                          disabled={decideMutation.isPending}
                          onClick={() =>
                            decideMutation.mutate({ id: item.id, action: 'REJECT' })
                          }
                        >
                          Rechazar
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
