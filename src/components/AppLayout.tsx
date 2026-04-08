import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

const getNavClassName = ({ isActive }: { isActive: boolean }): string =>
  isActive ? 'nav-link nav-link-active' : 'nav-link'

export const AppLayout = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="shell">
      <header className="shell-header">
        <div>
          <h1>Panel de Administración</h1>
          <p>Revisión documental de proveedores</p>
        </div>

        <div className="shell-user">
          <span>{user?.fullName ?? user?.email ?? 'Administrador'}</span>
          <span className="shell-role">{user?.role ?? '-'}</span>
          <button type="button" className="ghost-button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <nav className="shell-nav">
        <NavLink to="/review-queue" className={getNavClassName}>
          Bandeja de revisión
        </NavLink>
        <NavLink to="/admin/users/new" className={getNavClassName}>
          Crear admin/moderador
        </NavLink>
      </nav>

      <main className="shell-content">
        <Outlet />
      </main>
    </div>
  )
}
