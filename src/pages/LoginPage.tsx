import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../api/error'
import { useAuth } from '../auth/useAuth'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated, isLoading, sessionNotice, dismissSessionNotice } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/review-queue" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Ingresa email y contraseña para continuar.')
      return
    }

    setSubmitting(true)

    try {
      await login(email.trim(), password)
      dismissSessionNotice()
      navigate('/review-queue', { replace: true })
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'No fue posible iniciar sesión.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Admin Access</h1>
        <p>Ingresa con tu cuenta ADMIN o MODERATOR para gestionar la revisión documental.</p>

        {sessionNotice ? (
          <div className="alert alert-warning">
            <span>{sessionNotice}</span>
            <button type="button" onClick={dismissSessionNotice}>
              Cerrar
            </button>
          </div>
        ) : null}

        {error ? <div className="alert alert-error">{error}</div> : null}

        <form onSubmit={handleSubmit} className="form-grid">
          <label htmlFor="email">Correo</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@empresa.com"
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Tu contraseña"
          />

          <button type="submit" className="primary-button" disabled={submitting || isLoading}>
            {submitting ? 'Validando...' : 'Iniciar sesión'}
          </button>
        </form>
      </section>
    </main>
  )
}
