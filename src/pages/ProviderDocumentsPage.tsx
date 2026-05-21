import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { getErrorMessage } from '../api/error'
import { getPendingDocuments, viewAndConsumeDocument } from '../api/identityDocumentApi'
import { getProviderProfile, verifyProvider } from '../api/reviewApi'
import { StatusPill } from '../components/StatusPill'
import { formatDateTime } from '../lib/format'
import type { PendingDocumentImage } from '../types/identityDocument'

export const ProviderDocumentsPage = () => {
  const queryClient = useQueryClient()
  const { providerUserId } = useParams<{ providerUserId: string }>()
  const [viewedDocument, setViewedDocument] = useState<PendingDocumentImage | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const providerProfileQuery = useQuery({
    queryKey: ['provider-profile', providerUserId],
    queryFn: () => getProviderProfile(providerUserId ?? ''),
    enabled: Boolean(providerUserId),
  })

  const documentsQuery = useQuery({
    queryKey: ['identity-documents-by-provider', providerUserId],
    queryFn: () => getPendingDocuments(providerUserId),
    enabled: Boolean(providerUserId),
  })

  const viewMutation = useMutation({
    mutationFn: (id: string) => viewAndConsumeDocument(id),
    onSuccess: async (doc) => {
      setViewedDocument(doc)
      setActionError(null)
      await queryClient.invalidateQueries({ queryKey: ['identity-documents-by-provider', providerUserId] })
      await queryClient.invalidateQueries({ queryKey: ['identity-documents'] })
    },
    onError: (error) => setActionError(getErrorMessage(error)),
  })

  const verifyMutation = useMutation({
    mutationFn: (action: 'APPROVE' | 'REJECT') =>
      verifyProvider(providerUserId ?? '', action),
    onSuccess: async (_, action) => {
      const msg = action === 'APPROVE' ? 'Técnico aprobado.' : 'Técnico rechazado.'
      setSuccessMessage(msg)
      setActionError(null)
      setViewedDocument(null)
      setTimeout(() => setSuccessMessage(null), 4000)
      await queryClient.invalidateQueries({ queryKey: ['provider-profile', providerUserId] })
      await queryClient.invalidateQueries({ queryKey: ['review-queue'] })
    },
    onError: (error) => setActionError(getErrorMessage(error)),
  })

  const profile = providerProfileQuery.data
  const verificationStatus =
    profile?.providerVerificationStatus ?? profile?.verificationStatus ?? profile?.status ?? 'N/D'

  if (!providerUserId) {
    return (
      <section className="panel">
        <article className="state-card error-state">No encontramos el proveedor solicitado.</article>
      </section>
    )
  }

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <h2>Detalle de verificación del proveedor</h2>
          <p>ID: {providerUserId}</p>
          {!providerProfileQuery.isLoading && (
            <p>
              Estado actual: <StatusPill value={verificationStatus} />
            </p>
          )}
        </div>
        <Link to="/review-queue" className="ghost-link">
          Volver a la bandeja
        </Link>
      </header>

      {successMessage ? <article className="state-card success-state">{successMessage}</article> : null}
      {actionError ? <article className="state-card error-state">{actionError}</article> : null}

      {viewedDocument ? (
        <div className="document-viewer">
          <header className="document-viewer-header">
            <div>
              <h3>Documento de identidad</h3>
              <p>{viewedDocument.fileName}</p>
            </div>
            <button type="button" className="ghost-button" onClick={() => setViewedDocument(null)}>
              Cerrar
            </button>
          </header>

          <div className="document-viewer-image">
            {viewedDocument.mimeType === 'application/pdf' ? (
              <iframe
                title="Documento de identidad"
                src={`data:application/pdf;base64,${viewedDocument.fileBase64}`}
                width="100%"
                height="600"
              />
            ) : (
              <img
                src={`data:${viewedDocument.mimeType};base64,${viewedDocument.fileBase64}`}
                alt="Documento de identidad"
                style={{ maxWidth: '100%', borderRadius: '8px' }}
              />
            )}
          </div>

          <div className="document-viewer-actions">
            <p className="hint-text">
              Verifica el documento en la Registraduría o la Policía antes de decidir.
            </p>
            <div className="document-actions">
              <button
                type="button"
                className="secondary-button"
                disabled={verifyMutation.isPending}
                onClick={() => verifyMutation.mutate('APPROVE')}
              >
                Aprobar técnico
              </button>
              <button
                type="button"
                className="danger-button"
                disabled={verifyMutation.isPending}
                onClick={() => verifyMutation.mutate('REJECT')}
              >
                Rechazar técnico
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div>
        <h3>Documentos de identidad pendientes</h3>
        {documentsQuery.isLoading ? (
          <article className="state-card">Cargando documentos...</article>
        ) : null}

        {documentsQuery.isError ? (
          <article className="state-card error-state">
            {getErrorMessage(documentsQuery.error)}
          </article>
        ) : null}

        {!documentsQuery.isLoading &&
        !documentsQuery.isError &&
        (documentsQuery.data?.length ?? 0) === 0 ? (
          <article className="state-card">
            Este proveedor no tiene documentos pendientes de revisión visual. Puedes aprobar o
            rechazar directamente desde la bandeja.
          </article>
        ) : null}

        {(documentsQuery.data?.length ?? 0) > 0 ? (
          <div className="table-wrapper">
            <table className="review-table">
              <thead>
                <tr>
                  <th>Archivo</th>
                  <th>Tipo</th>
                  <th>Recibido</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {documentsQuery.data?.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.fileName}</td>
                    <td>
                      <StatusPill value={doc.mimeType.includes('pdf') ? 'PDF' : 'IMAGEN'} />
                    </td>
                    <td>{formatDateTime(doc.receivedAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="secondary-button"
                        disabled={viewMutation.isPending}
                        onClick={() => viewMutation.mutate(doc.id)}
                      >
                        Ver documento
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <div>
        <h3>Decisión rápida</h3>
        <p className="hint-text">
          Si ya verificaste al técnico externamente, puedes tomar la decisión sin ver el documento.
        </p>
        <div className="document-actions" style={{ marginTop: '0.5rem' }}>
          <button
            type="button"
            className="secondary-button"
            disabled={verifyMutation.isPending}
            onClick={() => verifyMutation.mutate('APPROVE')}
          >
            Aprobar técnico
          </button>
          <button
            type="button"
            className="danger-button"
            disabled={verifyMutation.isPending}
            onClick={() => verifyMutation.mutate('REJECT')}
          >
            Rechazar técnico
          </button>
        </div>
      </div>
    </section>
  )
}
