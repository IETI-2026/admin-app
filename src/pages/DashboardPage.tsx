import { useMemo, useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import type { AuthSessionState } from '../modules/auth/hooks/useAuthSession';
import { useProvidersAdmin } from '../modules/providers/hooks/useProvidersAdmin';
import { useServiceRequestsAdmin } from '../modules/service-requests/hooks/useServiceRequestsAdmin';
import { useUsersAdmin } from '../modules/users/hooks/useUsersAdmin';
import type {
  ProviderVerificationAction,
  ServiceRequestStatus,
  UserStatus,
} from '../types/api';

type DashboardTab = 'users' | 'technicians' | 'requests';

interface DashboardPageProps {
  authState: AuthSessionState;
  onLogout: () => Promise<void>;
}

const userStatusOptions: { value: UserStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'INACTIVE', label: 'Inactivo' },
  { value: 'SUSPENDED', label: 'Suspendido' },
  { value: 'DELETED', label: 'Eliminado' },
];

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

function userStatusTone(
  status: UserStatus,
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'ACTIVE') return 'success';
  if (status === 'INACTIVE') return 'warning';
  if (status === 'SUSPENDED' || status === 'DELETED') return 'danger';
  return 'neutral';
}

function requestStatusTone(
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

function providerStatusTone(
  verificationStatus: string,
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (verificationStatus === 'VERIFIED') return 'success';
  if (verificationStatus === 'UNDER_REVIEW' || verificationStatus === 'UNVERIFIED') {
    return 'warning';
  }

  if (verificationStatus === 'REJECTED' || verificationStatus === 'SUSPENDED') {
    return 'danger';
  }

  return 'neutral';
}

export function DashboardPage({ authState, onLogout }: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('users');
  const [feedback, setFeedback] = useState<string | null>(null);

  const usersAdmin = useUsersAdmin(activeTab === 'users');
  const providersAdmin = useProvidersAdmin(activeTab === 'technicians');
  const requestsAdmin = useServiceRequestsAdmin(activeTab === 'requests');

  const headerSubtitle = useMemo(() => {
    if (activeTab === 'users') {
      return 'Gestiona estados de cuenta y ciclo de vida de usuarios.';
    }

    if (activeTab === 'technicians') {
      return 'Valida perfiles técnicos y actualiza su estado de verificación.';
    }

    return 'Monitorea solicitudes de servicio y su estado operativo.';
  }, [activeTab]);

  const isLoading =
    activeTab === 'users'
      ? usersAdmin.isLoading
      : activeTab === 'technicians'
        ? providersAdmin.isLoading
        : requestsAdmin.isLoading;

  const error =
    activeTab === 'users'
      ? usersAdmin.error
      : activeTab === 'technicians'
        ? providersAdmin.error
        : requestsAdmin.error;

  const handleToggleUserStatus = async (
    userId: string,
    status: UserStatus,
  ): Promise<void> => {
    setFeedback(null);
    await usersAdmin.toggleUserStatus(userId, status);
    setFeedback('Estado de usuario actualizado correctamente.');
  };

  const handleDeleteUser = async (
    userId: string,
    hard = false,
  ): Promise<void> => {
    setFeedback(null);
    await usersAdmin.deleteUser(userId, hard);
    setFeedback(hard ? 'Usuario eliminado permanentemente.' : 'Usuario eliminado (soft delete).');
  };

  const handleUpdateProvider = async (
    userId: string,
    action: ProviderVerificationAction,
  ): Promise<void> => {
    setFeedback(null);
    await providersAdmin.updateVerification(userId, action);
    setFeedback('Estado de verificación del técnico actualizado.');
  };

  return (
    <main className="min-h-screen w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-6 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Panel Administrativo Cameya</h1>
              <p className="mt-1 text-sm text-slate-500">{headerSubtitle}</p>
              <p className="mt-2 text-xs text-slate-500">
                Sesión: {authState.user?.fullName ?? 'Admin'}
              </p>
            </div>
            <Button variant="ghost" onClick={() => void onLogout()}>
              Cerrar sesión
            </Button>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <Button
              variant={activeTab === 'users' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('users')}
            >
              Usuarios
            </Button>
            <Button
              variant={activeTab === 'technicians' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('technicians')}
            >
              Técnicos
            </Button>
            <Button
              variant={activeTab === 'requests' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('requests')}
            >
              Solicitudes
            </Button>
          </div>
        </header>

        {feedback ? (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {feedback}
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {activeTab === 'users' ? (
          <Card
            title="Administración de usuarios"
            subtitle="Filtro por estado y acciones de actualización/eliminación"
            rightSlot={
              <div className="w-56">
                <Select
                  label="Estado"
                  value={usersAdmin.userStatusFilter}
                  onChange={(event) =>
                    usersAdmin.setUserStatusFilter(event.target.value as UserStatus)
                  }
                  options={userStatusOptions}
                />
              </div>
            }
          >
            {isLoading ? (
              <p className="text-sm text-slate-500">Cargando usuarios...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-2">Nombre</th>
                      <th className="px-2">Contacto</th>
                      <th className="px-2">Estado</th>
                      <th className="px-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersAdmin.users.map((user) => (
                      <tr key={user.id} className="rounded-lg bg-slate-50 text-sm text-slate-700">
                        <td className="rounded-l-lg px-2 py-2">
                          <p className="font-semibold text-slate-800">{user.fullName}</p>
                          <p className="text-xs text-slate-500">{user.id}</p>
                        </td>
                        <td className="px-2 py-2">
                          <p>{user.email ?? 'Sin correo'}</p>
                          <p className="text-xs text-slate-500">{user.phoneNumber ?? 'Sin teléfono'}</p>
                        </td>
                        <td className="px-2 py-2">
                          <Badge tone={userStatusTone(user.status)}>{user.status}</Badge>
                        </td>
                        <td className="rounded-r-lg px-2 py-2">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="secondary"
                              onClick={() =>
                                void handleToggleUserStatus(user.id, user.status)
                              }
                            >
                              {user.status === 'ACTIVE' ? 'Suspender' : 'Activar'}
                            </Button>
                            <Button variant="danger" onClick={() => void handleDeleteUser(user.id)}>
                              Soft delete
                            </Button>
                            <Button
                              variant="ghost"
                              className="text-rose-700"
                              onClick={() => void handleDeleteUser(user.id, true)}
                            >
                              Hard delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        ) : null}

        {activeTab === 'technicians' ? (
          <Card
            title="Validación de técnicos"
            subtitle="Gestión de estados: APPROVE, REJECT, SUSPEND"
          >
            {isLoading ? (
              <p className="text-sm text-slate-500">Cargando técnicos...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-2">Usuario</th>
                      <th className="px-2">Estado</th>
                      <th className="px-2">Métricas</th>
                      <th className="px-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providersAdmin.providers.map((provider) => (
                      <tr key={provider.id} className="rounded-lg bg-slate-50 text-sm text-slate-700">
                        <td className="rounded-l-lg px-2 py-2">
                          <p className="font-semibold text-slate-800">{provider.userId}</p>
                          <p className="text-xs text-slate-500">
                            {provider.skills.length > 0
                              ? provider.skills.join(', ')
                              : 'Sin habilidades registradas'}
                          </p>
                        </td>
                        <td className="px-2 py-2">
                          <Badge tone={providerStatusTone(provider.verificationStatus)}>
                            {provider.verificationStatus}
                          </Badge>
                        </td>
                        <td className="px-2 py-2 text-xs">
                          <p>Rating: {provider.averageRating.toFixed(2)}</p>
                          <p>Completados: {provider.totalCompletedServices}</p>
                          <p>Cancelados: {provider.totalCancelledServices}</p>
                        </td>
                        <td className="rounded-r-lg px-2 py-2">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="secondary"
                              onClick={() => void handleUpdateProvider(provider.userId, 'APPROVE')}
                            >
                              Aprobar
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => void handleUpdateProvider(provider.userId, 'REJECT')}
                            >
                              Rechazar
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => void handleUpdateProvider(provider.userId, 'SUSPEND')}
                            >
                              Suspender
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        ) : null}

        {activeTab === 'requests' ? (
          <Card
            title="Monitoreo de solicitudes"
            subtitle="Consulta operacional de estados y asignaciones"
            rightSlot={
              <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
                <Select
                  label="Estado"
                  value={requestsAdmin.requestStatusFilter}
                  onChange={(event) =>
                    requestsAdmin.setRequestStatusFilter(
                      event.target.value as ServiceRequestStatus | 'ALL',
                    )
                  }
                  options={requestStatusOptions}
                />
                <Input
                  label="Ciudad"
                  value={requestsAdmin.requestCityFilter}
                  onChange={(event) => requestsAdmin.setRequestCityFilter(event.target.value)}
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
                    {requestsAdmin.requests.map((request) => (
                      <tr key={request.id} className="rounded-lg bg-slate-50 text-sm text-slate-700">
                        <td className="rounded-l-lg px-2 py-2">
                          <p className="font-semibold text-slate-800">{request.id}</p>
                          <p className="text-xs text-slate-500">{request.serviceCity}</p>
                        </td>
                        <td className="px-2 py-2">
                          <Badge tone={requestStatusTone(request.status)}>{request.status}</Badge>
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
        ) : null}
      </div>
    </main>
  );
}
