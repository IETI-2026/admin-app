import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../api/error'
import { getReviewQueue } from '../api/reviewApi'
import { StatusPill } from '../components/StatusPill'
import { formatDateTime } from '../lib/format'
import type { ReviewQueueStatus } from '../types/provider'

const STATUS_OPTIONS: ReviewQueueStatus[] = ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ALL']

export const ReviewQueuePage = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(20)
  const [status, setStatus] = useState<ReviewQueueStatus>('PENDING_REVIEW')

  const queueQuery = useQuery({
    queryKey: ['review-queue', page, limit, status],
    queryFn: () => getReviewQueue({ page, limit, status }),
  })

  const items = queueQuery.data?.items ?? []
  const totalPages = queueQuery.data?.totalPages ?? 0

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <h2>Bandeja de revisión documental</h2>
          <p>Revisa documentos por proveedor y toma decisiones de aprobación o rechazo.</p>
        </div>

        <div className="toolbar">
          <label htmlFor="status-filter">Estado</label>
          <select
            id="status-filter"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as ReviewQueueStatus)
              setPage(0)
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <label htmlFor="limit-filter">Items</label>
          <select
            id="limit-filter"
            value={limit}
            onChange={(event) => {
              setLimit(Number(event.target.value))
              setPage(0)
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </header>

      {queueQuery.isLoading ? (
        <article className="state-card">Cargando bandeja...</article>
      ) : null}

      {queueQuery.isError ? (
        <article className="state-card error-state">{getErrorMessage(queueQuery.error)}</article>
      ) : null}

      {!queueQuery.isLoading && !queueQuery.isError && items.length === 0 ? (
        <article className="state-card">No hay documentos para el filtro seleccionado.</article>
      ) : null}

      {!queueQuery.isLoading && !queueQuery.isError && items.length > 0 ? (
        <>
          <div className="table-wrapper">
            <table className="review-table">
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th>Tipo</th>
                  <th>Documento</th>
                  <th>Estado documento</th>
                  <th>Estado proveedor</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={`${item.providerUserId}-${item.documentId}`}>
                    <td>{item.providerFullName}</td>
                    <td>{item.documentType}</td>
                    <td>{item.providerDocumentId}</td>
                    <td>
                      <StatusPill value={item.documentStatus} />
                    </td>
                    <td>
                      <StatusPill value={item.providerVerificationStatus} />
                    </td>
                    <td>{formatDateTime(item.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => navigate(`/providers/${item.providerUserId}`)}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="pagination">
            <button
              type="button"
              className="ghost-button"
              disabled={page === 0}
              onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
            >
              Anterior
            </button>

            <span>
              Página {page + 1}
              {totalPages > 0 ? ` de ${totalPages}` : ''}
            </span>

            <button
              type="button"
              className="ghost-button"
              disabled={totalPages > 0 ? page + 1 >= totalPages : items.length < limit}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              Siguiente
            </button>
          </footer>
        </>
      ) : null}
    </section>
  )
}
