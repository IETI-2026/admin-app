import { useState } from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Card } from '../components/ui/card';
import { useInsightsKpis } from '../modules/health/hooks/useInsightsKpis';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend,
);

const CHART_OPTIONS_BASE = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
} as const;

const PAGE_COLORS = [
  'rgba(79, 70, 229, 0.85)',
  'rgba(34, 197, 94, 0.85)',
  'rgba(249, 115, 22, 0.85)',
  'rgba(239, 68, 68, 0.85)',
  'rgba(168, 85, 247, 0.85)',
  'rgba(20, 184, 166, 0.85)',
  'rgba(251, 191, 36, 0.85)',
  'rgba(99, 102, 241, 0.85)',
];

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-lg shadow-indigo-100/40 backdrop-blur-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent ?? 'text-slate-900'}`}>{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-400">{sub}</p> : null}
    </section>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-40 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
      Sin datos en el período seleccionado
    </div>
  );
}

export const AppHealthPage = () => {
  const [days, setDays] = useState<7 | 30>(7);
  const { data: kpis, isLoading, isError, error, refetch, isFetching } = useInsightsKpis(days);

  const failureRate =
    kpis && kpis.summary.total > 0
      ? ((kpis.summary.failures / kpis.summary.total) * 100).toFixed(1)
      : '0.0';

  const totalSessions = kpis?.activeSessionsPerDay.reduce((s, r) => s + r.sessions, 0) ?? 0;

  const allDates = [
    ...new Set([
      ...(kpis?.requestsPerDay.map((r) => r.date) ?? []),
      ...(kpis?.errorsPerDay.map((r) => r.date) ?? []),
    ]),
  ].sort();

  const requestsMap = new Map(kpis?.requestsPerDay.map((r) => [r.date, r.count]) ?? []);
  const errorsMap = new Map(kpis?.errorsPerDay.map((r) => [r.date, r.count]) ?? []);

  const requestsChartData = {
    labels: allDates,
    datasets: [
      {
        label: 'Solicitudes',
        data: allDates.map((d) => requestsMap.get(d) ?? 0),
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderRadius: 6,
      },
      {
        label: 'Errores',
        data: allDates.map((d) => errorsMap.get(d) ?? 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 6,
      },
    ],
  };

  const responseTimeData = {
    labels: kpis?.avgResponseTimePerDay.map((r) => r.date) ?? [],
    datasets: [
      {
        label: 'ms',
        data: kpis?.avgResponseTimePerDay.map((r) => r.avgMs) ?? [],
        borderColor: 'rgba(249, 115, 22, 0.9)',
        backgroundColor: 'rgba(249, 115, 22, 0.15)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const sessionsData = {
    labels: kpis?.activeSessionsPerDay.map((r) => r.date) ?? [],
    datasets: [
      {
        label: 'Sesiones',
        data: kpis?.activeSessionsPerDay.map((r) => r.sessions) ?? [],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderRadius: 6,
      },
    ],
  };

  const exceptionsData = {
    labels: kpis?.exceptionsPerDay.map((r) => r.date) ?? [],
    datasets: [
      {
        label: 'Excepciones',
        data: kpis?.exceptionsPerDay.map((r) => r.count) ?? [],
        backgroundColor: 'rgba(239, 68, 68, 0.55)',
        borderRadius: 6,
      },
    ],
  };

  const topPagesData = {
    labels: kpis?.topPages.map((p) => p.name) ?? [],
    datasets: [
      {
        data: kpis?.topPages.map((p) => p.views) ?? [],
        backgroundColor: PAGE_COLORS,
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="w-full space-y-6 overflow-x-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Salud de la aplicación</h1>
          <p className="text-sm text-slate-600">
            Métricas en tiempo real desde Azure Application Insights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-200 bg-white p-1 text-sm font-medium">
            {([7, 30] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-md px-3 py-1.5 transition-colors ${
                  days === d
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <button
            onClick={() => void refetch()}
            disabled={isFetching}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {isFetching ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Error al consultar Application Insights:{' '}
          {error instanceof Error ? error.message : 'Error desconocido'}
        </div>
      ) : null}

      <div className="grid max-w-3xl grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label="Llamadas API (24h)"
          value={isLoading ? '...' : String(kpis?.summary.total ?? 0)}
          sub="Solicitudes HTTP al backend"
        />
        <KpiCard
          label="Tasa de error (24h)"
          value={isLoading ? '...' : `${failureRate}%`}
          sub={`${kpis?.summary.failures ?? 0} solicitudes fallidas`}
          accent={
            Number(failureRate) > 5
              ? 'text-rose-600'
              : Number(failureRate) > 1
                ? 'text-amber-600'
                : 'text-emerald-600'
          }
        />
        <KpiCard
          label="Resp. promedio (24h)"
          value={isLoading ? '...' : `${kpis?.summary.avgDuration ?? 0} ms`}
          sub="Duración media de requests"
          accent={
            (kpis?.summary.avgDuration ?? 0) > 2000
              ? 'text-rose-600'
              : (kpis?.summary.avgDuration ?? 0) > 800
                ? 'text-amber-600'
                : 'text-slate-900'
          }
        />
        <KpiCard
          label={`Sesiones activas (${days}d)`}
          value={isLoading ? '...' : String(totalSessions)}
          sub="Usuarios únicos en Flutter"
        />
      </div>

      <div className="grid max-w-3xl grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="min-w-0">
          <Card title="Solicitudes de API" subtitle={`Últimos ${days} días`}>
            {!isLoading && allDates.length === 0 ? (
              <EmptyChart />
            ) : (
              <div className="h-36 w-full">
                <Bar
                  data={requestsChartData}
                  options={{
                    ...CHART_OPTIONS_BASE,
                    plugins: { legend: { display: true, position: 'bottom' as const, labels: { boxWidth: 10, font: { size: 11 } } } },
                  }}
                />
              </div>
            )}
          </Card>
        </div>

        <div className="min-w-0">
          <Card title="Tiempo de respuesta" subtitle={`Últimos ${days} días (ms)`}>
            {!isLoading && (kpis?.avgResponseTimePerDay.length ?? 0) === 0 ? (
              <EmptyChart />
            ) : (
              <div className="h-36 w-full">
                <Line
                  data={responseTimeData}
                  options={{
                    ...CHART_OPTIONS_BASE,
                    scales: { y: { beginAtZero: true } },
                  }}
                />
              </div>
            )}
          </Card>
        </div>

        <div className="min-w-0">
          <Card title="Sesiones activas" subtitle={`Últimos ${days} días`}>
            {!isLoading && (kpis?.activeSessionsPerDay.length ?? 0) === 0 ? (
              <EmptyChart />
            ) : (
              <div className="h-36 w-full">
                <Bar data={sessionsData} options={CHART_OPTIONS_BASE} />
              </div>
            )}
          </Card>
        </div>

        <div className="min-w-0">
          <Card title="Excepciones" subtitle={`Últimos ${days} días`}>
            {!isLoading && (kpis?.exceptionsPerDay.length ?? 0) === 0 ? (
              <EmptyChart />
            ) : (
              <div className="h-36 w-full">
                <Bar data={exceptionsData} options={CHART_OPTIONS_BASE} />
              </div>
            )}
          </Card>
        </div>
      </div>

      {(kpis?.topPages.length ?? 0) > 0 ? (
        <Card
          title="Páginas más visitadas"
          subtitle={`Últimos ${days} días — vistas desde la app Flutter`}
        >
          <div className="mx-auto h-36 max-w-[220px]">
            <Doughnut
              data={topPagesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' as const, labels: { boxWidth: 10, font: { size: 11 } } } },
              }}
            />
          </div>
        </Card>
      ) : null}
    </div>
  );
};
