import { useState, type FormEvent } from 'react'

interface RejectModalProps {
  isOpen: boolean
  documentType: string
  isSubmitting: boolean
  onCancel: () => void
  onConfirm: (reason?: string) => Promise<void>
}

export const RejectModal = ({
  isOpen,
  documentType,
  isSubmitting,
  onCancel,
  onConfirm,
}: RejectModalProps) => {
  const [reason, setReason] = useState('')

  if (!isOpen) {
    return null
  }

  const handleCancel = () => {
    setReason('')
    onCancel()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onConfirm(reason.trim() ? reason.trim() : undefined)
    setReason('')
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Rechazar documento">
      <article className="modal-card">
        <h3>Rechazar documento</h3>
        <p>
          Estás rechazando <strong>{documentType}</strong>. Agrega un motivo opcional para dejar
          trazabilidad.
        </p>

        <form onSubmit={handleSubmit} className="modal-form">
          <label htmlFor="reject-reason">Motivo</label>
          <textarea
            id="reject-reason"
            rows={4}
            placeholder="Ejemplo: documento vencido o ilegible"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />

          <div className="modal-actions">
            <button
              type="button"
              className="ghost-button"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className="danger-button" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Confirmar rechazo'}
            </button>
          </div>
        </form>
      </article>
    </div>
  )
}
