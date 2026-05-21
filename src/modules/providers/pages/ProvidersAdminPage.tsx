import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { useProvidersAdmin } from '../hooks/useProvidersAdmin';
import type { ProviderVerificationAction } from '../../../types/api';

function getProviderTone(
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

export function ProvidersAdminPage() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const { providers, isLoading, error, updateVerification } = useProvidersAdmin(true);

  const handleUpdate = async (
    userId: string,
    action: ProviderVerificationAction,
  ): Promise<void> => {
    setFeedback(null);
    await updateVerification(userId, action);
    setFeedback('Estado de verificación actualizado.');
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
        title="Validación de Técnicos"
        subtitle="Gestión de estados APPROVE / REJECT / SUSPEND"
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
                {providers.map((provider) => (
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
                      <Badge tone={getProviderTone(provider.verificationStatus)}>
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
                          onClick={() => void handleUpdate(provider.userId, 'APPROVE')}
                        >
                          Aprobar
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => void handleUpdate(provider.userId, 'REJECT')}
                        >
                          Rechazar
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => void handleUpdate(provider.userId, 'SUSPEND')}
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
    </div>
  );
}
