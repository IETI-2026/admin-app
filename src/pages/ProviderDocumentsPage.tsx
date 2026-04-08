import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { getErrorMessage } from '../api/error'
import { decideDocument, getProviderDocuments, getProviderProfile } from '../api/reviewApi'
import { RejectModal } from '../components/RejectModal'
import { StatusPill } from '../components/StatusPill'
import { formatDate, formatDateTime } from '../lib/format'
import type { DocumentDecision, ProviderDocument } from '../types/provider'

interface DecisionRequest {
  documentId: string
  decision: DocumentDecision
  reason?: string
}

export const ProviderDocumentsPage = () => {
  const queryClient = useQueryClient()
  const { providerUserId } = useParams<{ providerUserId: string }>()
  const [selectedDocument, setSelectedDocument] = useState<ProviderDocument | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const documentsQuery = useQuery({
    queryKey: ['provider-documents', providerUserId],
    queryFn: () => getProviderDocuments(providerUserId ?? ''),
    enabled: Boolean(providerUserId),
  })

  const providerProfileQuery = useQuery({
    queryKey: ['provider-profile', providerUserId],
    queryFn: () => getProviderProfile(providerUserId ?? ''),
    enabled: Boolean(providerUserId),
  })

  const decisionMutation = useMutation({
    mutationFn: async ({ documentId, decision, reason }: DecisionRequest) => {
      if (!providerUserId) {
        throw new Error('No encontramos el proveedor a revisar.')
      }

      await decideDocument(providerUserId, documentId, {
        decision,
        reason,
      })
    },
    onSuccess: async (_, variables) => {
      setSuccessMessage(
        variables.decision === 'APPROVED'
          ? 'Documento aprobado correctamente.'
          : 'Documento rechazado correctamente.',
      )
      setActionError(null)
      setSelectedDocument(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['provider-documents', providerUserId] }),
        queryClient.invalidateQueries({ queryKey: ['review-queue'] }),
        queryClient.invalidateQueries({ queryKey: ['provider-profile', providerUserId] }),
      ])
    },
    onError: (error) => {
      setActionError(getErrorMessage(error))
    },
  })

  const providerVerificationStatus = useMemo(() => {
    const profile = providerProfileQuery.data
    return profile?.providerVerificationStatus ?? profile?.verificationStatus ?? profile?.status ?? 'N/D'
  }, [providerProfileQuery.data])

  if (!providerUserId) {
    return (
      <section className="panel">
        <article className="state-card error-state">No encontramos el proveedor solicitado.</article>
      </section>
    )
  }

  const handleApprove = async (documentId: string) => {
    setSuccessMessage(null)
    setActionError(null)

    const confirmed = window.confirm('¿Confirmas la aprobación de este documento?')

    if (!confirmed) {
      return
    }

    await decisionMutation.mutateAsync({ documentId, decision: 'APPROVED' })
  }

  const handleReject = async (reason?: string) => {
    if (!selectedDocument) {
      return
    }

    setSuccessMessage(null)
    setActionError(null)

    await decisionMutation.mutateAsync({
      documentId: selectedDocument.id,
      decision: 'REJECTED',
      reason,
    })
  }

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <h2>Detalle documental de proveedor</h2>
          <p>Proveedor: {providerUserId}</p>
          <p>
            Estado final del proveedor: <StatusPill value={providerVerificationStatus} />
          </p>
        </div>
        <Link to="/review-queue" className="ghost-link">
          Volver a la bandeja
        </Link>
      </header>

      {successMessage ? <article className="state-card success-state">{successMessage}</article> : null}
      {actionError ? <article className="state-card error-state">{actionError}</article> : null}

      {documentsQuery.isLoading ? <article className="state-card">Cargando documentos...</article> : null}
      {documentsQuery.isError ? (
        <article className="state-card error-state">{getErrorMessage(documentsQuery.error)}</article>
      ) : null}

      {!documentsQuery.isLoading && !documentsQuery.isError && (documentsQuery.data?.length ?? 0) === 0 ? (
        <article className="state-card">El proveedor no tiene documentos para revisar.</article>
      ) : null}

      {!documentsQuery.isLoading && !documentsQuery.isError && (documentsQuery.data?.length ?? 0) > 0 ? (
        <div className="document-grid">
          {documentsQuery.data?.map((document) => (
            <article key={document.id} className="document-card">
              <header>
                <h3>{document.documentType}</h3>
                <StatusPill value={document.status} />
              </header>

              <dl>
                <dt>ID</dt>
                <dd>{document.id}</dd>

                <dt>Hash</dt>
                <dd>{document.documentHash}</dd>

                <dt>Emitido</dt>
                <dd>{formatDate(document.issuedAt)}</dd>

                <dt>Expira</dt>
                <dd>{formatDate(document.expiresAt)}</dd>

                <dt>Verificado</dt>
                <dd>{formatDateTime(document.verifiedAt)}</dd>

                <dt>Rechazo</dt>
                <dd>{document.rejectionReason ?? '-'}</dd>
              </dl>

              <div className="document-actions">
                <a href={document.fileUrl} className="ghost-link" target="_blank" rel="noreferrer">
                  Ver archivo
                </a>

                <button
                  type="button"
                  className="secondary-button"
                  disabled={decisionMutation.isPending}
                  onClick={() => {
                    void handleApprove(document.id)
                  }}
                >
                  Aprobar
                </button>

                <button
                  type="button"
                  className="danger-button"
                  disabled={decisionMutation.isPending}
                  onClick={() => setSelectedDocument(document)}
                >
                  Rechazar
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <RejectModal
        isOpen={Boolean(selectedDocument)}
        documentType={selectedDocument?.documentType ?? 'Documento'}
        isSubmitting={decisionMutation.isPending}
        onCancel={() => setSelectedDocument(null)}
        onConfirm={handleReject}
      />
    </section>
  )
}
