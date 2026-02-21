import { NavLink } from 'react-router-dom';
import { Card } from '../components/ui/card';

const summaryCards = [
  {
    title: 'Gestión de Usuarios',
    description: 'Administra estados de cuentas, suspensiones y eliminaciones.',
    to: '/dashboard/users',
  },
  {
    title: 'Validación Técnicos',
    description: 'Aprueba, rechaza o suspende perfiles técnicos.',
    to: '/dashboard/technicians',
  },
  {
    title: 'Solicitudes de Servicio',
    description: 'Monitorea el estado operativo de solicitudes.',
    to: '/dashboard/requests',
  },
  {
    title: 'Mi Perfil',
    description: 'Actualiza tu información personal de administrador.',
    to: '/dashboard/profile',
  },
];

export function DashboardHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-600">
          Centro de administración con navegación modular.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title} title={card.title} subtitle={card.description}>
            <NavLink
              to={card.to}
              className="inline-flex rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Ir al módulo
            </NavLink>
          </Card>
        ))}
      </div>
    </div>
  );
}
