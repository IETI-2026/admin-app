import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Select } from '../../../components/ui/Select';
import { useUsersAdmin } from '../hooks/useUsersAdmin';
import type { UserStatus } from '../../../types/api';

const userStatusOptions: { value: UserStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'INACTIVE', label: 'Inactivo' },
  { value: 'SUSPENDED', label: 'Suspendido' },
  { value: 'DELETED', label: 'Eliminado' },
];

function getStatusTone(status: UserStatus): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'ACTIVE') return 'success';
  if (status === 'INACTIVE') return 'warning';
  if (status === 'SUSPENDED' || status === 'DELETED') return 'danger';
  return 'neutral';
}

export function UsersAdminPage() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const { users, userStatusFilter, setUserStatusFilter, isLoading, error, toggleUserStatus, deleteUser } =
    useUsersAdmin(true);

  const handleToggleStatus = async (
    userId: string,
    currentStatus: UserStatus,
  ): Promise<void> => {
    setFeedback(null);
    await toggleUserStatus(userId, currentStatus);
    setFeedback('Estado de usuario actualizado.');
  };

  const handleDelete = async (userId: string, hard = false): Promise<void> => {
    setFeedback(null);
    await deleteUser(userId, hard);
    setFeedback(hard ? 'Usuario eliminado permanentemente.' : 'Usuario eliminado (soft delete).');
  };

  return (
    <div className="space-y-4">
      {feedback ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {feedback}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <Card
        title="Administración de Usuarios"
        subtitle="Gestión de estados y ciclo de vida"
        rightSlot={
          <div className="w-56">
            <Select
              label="Estado"
              value={userStatusFilter}
              onChange={(event) => setUserStatusFilter(event.target.value as UserStatus)}
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
                {users.map((user) => (
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
                      <Badge tone={getStatusTone(user.status)}>{user.status}</Badge>
                    </td>
                    <td className="rounded-r-lg px-2 py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => void handleToggleStatus(user.id, user.status)}
                        >
                          {user.status === 'ACTIVE' ? 'Suspender' : 'Activar'}
                        </Button>
                        <Button variant="danger" onClick={() => void handleDelete(user.id)}>
                          Soft delete
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-rose-700"
                          onClick={() => void handleDelete(user.id, true)}
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
    </div>
  );
}
