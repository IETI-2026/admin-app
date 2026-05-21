import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import type { AllowedRole } from '../types/auth'

interface ProtectedRouteProps {
  allowedRoles: AllowedRole[]
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isLoading, isAuthenticated, user } = useAuth()

  if (isLoading) {
    return (
      <main className="state-container">
        <article className="state-card">
          <h2>Validando sesión</h2>
          <p>Estamos confirmando tus credenciales.</p>
        </article>
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role as AllowedRole)) {
    return (
      <main className="state-container">
        <article className="state-card">
          <h2>Acceso restringido</h2>
          <p>No cuentas con permisos para visualizar este módulo.</p>
        </article>
      </main>
    )
  }

  return <Outlet />
}
