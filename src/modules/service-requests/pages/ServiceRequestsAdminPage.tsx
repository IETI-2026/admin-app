import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useServiceRequestsAdmin } from '../hooks/useServiceRequestsAdmin';
import type { ServiceRequestStatus } from '../../../types/api';

const requestStatusOptions: { value: ServiceRequestStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'REQUESTED', label: 'Requested' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'ON_THE_WAY', label: 'On the way' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'FAILED', label: 'Failed' },
];

function getRequestTone(
  status: ServiceRequestStatus,
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (status === 'COMPLETED') return 'success';
  if (
    status === 'REQUESTED' ||
    status === 'ASSIGNED' ||
    status === 'ON_THE_WAY' ||
    status === 'IN_PROGRESS'
  ) {
    return 'info';
  }
  if (status === 'CANCELLED' || status === 'FAILED') return 'danger';
  return 'neutral';
}

export function ServiceRequestsAdminPage() {
  const {
    requests,
    requestStatusFilter,
    requestCityFilter,
    setRequestStatusFilter,
    setRequestCityFilter,
    isLoading,
    error,
  } = useServiceRequestsAdmin(true);

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <Card
        title="Monitoreo de Solicitudes"
        subtitle="Consulta operacional de estados y asignaciones"
        rightSlot={
          <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
            <Select
              label="Estado"
              value={requestStatusFilter}
              onChange={(event) =>
                setRequestStatusFilter(event.target.value as ServiceRequestStatus | 'ALL')
              }
              options={requestStatusOptions}
            />
            <Input
              label="Ciudad"
              value={requestCityFilter}
              onChange={(event) => setRequestCityFilter(event.target.value)}
              placeholder="bogota"
            />
          </div>
        }
      >
        {isLoading ? (
          <p className="text-sm text-slate-500">Cargando solicitudes...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-2">ID / Ciudad</th>
                  <th className="px-2">Estado</th>
                  <th className="px-2">Detalle</th>
                  <th className="px-2">Técnicos</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="rounded-lg bg-slate-50 text-sm text-slate-700">
                    <td className="rounded-l-lg px-2 py-2">
                      <p className="font-semibold text-slate-800">{request.id}</p>
                      <p className="text-xs text-slate-500">{request.serviceCity}</p>
                    </td>
                    <td className="px-2 py-2">
                      <Badge tone={getRequestTone(request.status)}>{request.status}</Badge>
                    </td>
                    <td className="px-2 py-2 text-xs text-slate-600">
                      <p>{request.problema}</p>
                      <p className="mt-1">Urgencia: {request.urgency}</p>
                    </td>
                    <td className="rounded-r-lg px-2 py-2 text-xs text-slate-600">
                      <p>Asignado: {request.assignedTechnicianId ?? 'Pendiente'}</p>
                      <p>Respuestas: {request.technicianResponses.length}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
