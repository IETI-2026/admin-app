import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getErrorMessage } from '../api/error'
import { getPendingDocuments, viewAndConsumeDocument } from '../api/identityDocumentApi'
import { verifyProvider } from '../api/reviewApi'
import { StatusPill } from '../components/StatusPill'
import { formatDateTime } from '../lib/format'
import type { PendingDocumentImage } from '../types/identityDocument'

export const IdentityDocumentQueuePage = () => {
  const queryClient = useQueryClient()
  const [viewedDocument, setViewedDocument] = useState<PendingDocumentImage | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const documentsQuery = useQuery({
    queryKey: ['identity-documents'],
    queryFn: () => getPendingDocuments(),
  })

  const viewMutation = useMutation({
    mutationFn: (id: string) => viewAndConsumeDocument(id),
    onSuccess: (doc) => {
      setViewedDocument(doc)
      setActionError(null)
      void queryClient.invalidateQueries({ queryKey: ['identity-documents'] })
    },
    onError: (error) => {
      setActionError(getErrorMessage(error))
    },
  })

  const verifyMutation = useMutation({
    mutationFn: ({ userId, action }: { userId: string; action: 'APPROVE' | 'REJECT' }) =>
      verifyProvider(userId, action),
    onSuccess: (_, variables) => {
      const msg =
        variables.action === 'APPROVE'
          ? 'Técnico aprobado correctamente.'
          : 'Técnico rechazado correctamente.'
      setSuccessMessage(msg)
      setActionError(null)
      setViewedDocument(null)
      setTimeout(() => setSuccessMessage(null), 4000)
    },
    onError: (error) => {
      setActionError(getErrorMessage(error))
    },
  })

  const items = documentsQuery.data ?? []

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <h2>Verificación de documentos de identidad</h2>
          <p>
            Documentos recibidos de técnicos para revisión manual. La imagen se elimina de memoria
            al visualizarla.
          </p>
        </div>
      </header>

      {successMessage ? (
        <article className="state-card success-state">{successMessage}</article>
      ) : null}
      {actionError ? <article className="state-card error-state">{actionError}</article> : null}

      {viewedDocument ? (
        <div className="document-viewer">
          <header className="document-viewer-header">
            <div>
              <h3>Documento de: {viewedDocument.userId}</h3>
              <p>{viewedDocument.fileName}</p>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={() => setViewedDocument(null)}
            >
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
              Verifica el documento en la base de datos de la Registraduría o la Policía antes de
              tomar una decisión.
            </p>
            <div className="document-actions">
              <button
                type="button"
                className="secondary-button"
                disabled={verifyMutation.isPending}
                onClick={() =>
                  verifyMutation.mutate({ userId: viewedDocument.userId, action: 'APPROVE' })
                }
              >
                Aprobar técnico
              </button>
              <button
                type="button"
                className="danger-button"
                disabled={verifyMutation.isPending}
                onClick={() =>
                  verifyMutation.mutate({ userId: viewedDocument.userId, action: 'REJECT' })
                }
              >
                Rechazar técnico
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {documentsQuery.isLoading ? (
        <article className="state-card">Cargando documentos pendientes...</article>
      ) : null}

      {documentsQuery.isError ? (
        <article className="state-card error-state">
          {getErrorMessage(documentsQuery.error)}
        </article>
      ) : null}

      {!documentsQuery.isLoading && !documentsQuery.isError && items.length === 0 ? (
        <article className="state-card">No hay documentos pendientes de revisión.</article>
      ) : null}

      {!documentsQuery.isLoading && !documentsQuery.isError && items.length > 0 ? (
        <div className="table-wrapper">
          <table className="review-table">
            <thead>
              <tr>
                <th>ID Técnico</th>
                <th>Archivo</th>
                <th>Tipo</th>
                <th>Recibido</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.userId}</td>
                  <td>{item.fileName}</td>
                  <td>
                    <StatusPill value={item.mimeType.includes('pdf') ? 'PDF' : 'IMAGEN'} />
                  </td>
                  <td>{formatDateTime(item.receivedAt)}</td>
                  <td>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={viewMutation.isPending}
                      onClick={() => viewMutation.mutate(item.id)}
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
    </section>
  )
}
