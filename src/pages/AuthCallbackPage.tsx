import { useEffect, useState } from 'react';

interface AuthCallbackPageProps {
  onComplete: (accessToken: string, refreshToken: string) => Promise<void>;
  onRefreshProfile: () => Promise<void>;
}

function getQueryParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

export function AuthCallbackPage({
  onComplete,
  onRefreshProfile,
}: AuthCallbackPageProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const execute = async () => {
      const query = getQueryParams();
      const message = query.get('message');
      if (message) {
        setError(message);
        return;
      }

      const accessToken = query.get('accessToken');
      const refreshToken = query.get('refreshToken');
      if (!accessToken || !refreshToken) {
        setError('No se recibieron credenciales válidas desde Google OAuth.');
        return;
      }

      try {
        await onComplete(accessToken, refreshToken);
        await onRefreshProfile();
      } catch {
        setError('No se pudo completar el inicio de sesión OAuth.');
      }
    };

    void execute();
  }, [onComplete, onRefreshProfile]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Validando autenticación
        </h1>
        {error ? (
          <p className="mt-3 text-sm text-rose-600">{error}</p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            Estamos procesando tu sesión, espera un momento...
          </p>
        )}
      </div>
    </main>
  );
}
