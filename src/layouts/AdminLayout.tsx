import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import type { AuthSessionState } from '../modules/auth/hooks/useAuthSession';
import type { AdminLayoutContextValue } from './admin-layout.context';

interface AdminLayoutProps {
  authState: AuthSessionState;
  onLogout: () => Promise<void>;
}

interface SidebarItem {
  label: string;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Usuarios', path: '/dashboard/users' },
  { label: 'Técnicos', path: '/dashboard/technicians' },
  { label: 'Solicitudes', path: '/dashboard/requests' },
  { label: 'Mi Perfil', path: '/dashboard/profile' },
];

export function AdminLayout({ authState, onLogout }: AdminLayoutProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-full bg-slate-100 text-slate-900">
      <aside className="hidden w-72 flex-col border-r border-slate-800 bg-slate-900 text-slate-100 lg:flex">
        <div className="border-b border-slate-800 px-6 py-5">
          <h1 className="text-xl font-bold tracking-wide">Cameya Admin</h1>
          <p className="mt-1 text-xs text-slate-400">Panel estilo Admin</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {sidebarItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 px-4 py-4 text-xs text-slate-400">
          Cameya Admin v1.0
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Panel Administrativo</p>
              <p className="text-xs text-slate-500">Ruta actual: {location.pathname}</p>
            </div>

            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                onClick={() => setIsProfileMenuOpen((previous) => !previous)}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {authState.user?.fullName?.slice(0, 2).toUpperCase() || 'AD'}
                </span>
                <span className="hidden sm:block">{authState.user?.fullName || 'Admin'}</span>
              </button>

              {isProfileMenuOpen ? (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                  <NavLink
                    to="/dashboard/profile"
                    className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    Editar perfil
                  </NavLink>
                  <Button
                    variant="danger"
                    className="mt-1 w-full"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      void onLogout();
                    }}
                  >
                    Cerrar sesión
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <section className="flex-1 p-4 sm:p-6">
          <Outlet context={{ authState, onLogout } satisfies AdminLayoutContextValue} />
        </section>

        <footer className="border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 sm:px-6">
          © {new Date().getFullYear()} Cameya Admin — Diseño tipo AdminLTE (sidebar + topbar + footer)
        </footer>
      </div>
    </div>
  );
}
