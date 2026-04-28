import { NavLink } from 'react-router-dom';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Card } from '../components/ui/card';
import { useDashboardMetrics } from '../modules/dashboard/hooks/useDashboardMetrics';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

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
  {
    title: 'Configuración',
    description: 'Gestiona parámetros globales del sistema.',
    to: '/dashboard/settings',
  },
];

export function DashboardHomePage() {
  const { metrics, requests, isLoading, error } = useDashboardMetrics();

  const requestsPerDay = requests.reduce<Record<string, number>>((accumulator, request) => {
    const dateKey = new Date(request.createdAt).toISOString().slice(0, 10);
    const currentValue = accumulator[dateKey] ?? 0;
    return {
      ...accumulator,
      [dateKey]: currentValue + 1,
    };
  }, {});

  const sortedDates = Object.keys(requestsPerDay).sort((left, right) => left.localeCompare(right)).slice(-7);

  const requestsByDayData = {
    labels: sortedDates,
    datasets: [
      {
        label: 'Solicitudes por día',
        data: sortedDates.map((date) => requestsPerDay[date] ?? 0),
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const usersStatusData = {
    labels: ['Activos', 'Suspendidos'],
    datasets: [
      {
        data: [metrics.usersActive, metrics.usersSuspended],
        backgroundColor: ['rgba(34, 197, 94, 0.85)', 'rgba(239, 68, 68, 0.85)'],
        borderWidth: 0,
      },
    ],
  };

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

      {error ? (
        <Card title="Error" subtitle="No se pudieron cargar todas las métricas.">
          <p className="text-sm text-rose-700">{error}</p>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Usuarios totales" subtitle="Cuentas registradas">
          <p className="text-3xl font-bold text-slate-900">{isLoading ? '...' : metrics.usersTotal}</p>
        </Card>
        <Card title="Solicitudes totales" subtitle="Operación acumulada">
          <p className="text-3xl font-bold text-slate-900">{isLoading ? '...' : metrics.requestsTotal}</p>
        </Card>
        <Card title="Solicitudes completadas" subtitle="Indicador de cierre">
          <p className="text-3xl font-bold text-slate-900">{isLoading ? '...' : metrics.requestsCompleted}</p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Tendencia de solicitudes" subtitle="Últimos días con actividad">
          <Bar
            data={requestsByDayData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
            }}
          />
        </Card>
        <Card title="Estado de usuarios" subtitle="Distribución por estado">
          <div className="mx-auto max-w-xs">
            <Doughnut
              data={usersStatusData}
              options={{
                responsive: true,
                plugins: { legend: { position: 'bottom' as const } },
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
