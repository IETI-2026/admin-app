import { LoginForm } from '../components/forms/LoginForm';
import { Button } from '../components/ui/button';
import type { LoginPayload } from '../types/api';

interface LoginPageProps {
  isLoading: boolean;
  error: string | null;
  onLogin: (payload: LoginPayload) => Promise<void>;
  onGoogleLogin: () => Promise<void>;
}

export function LoginPage({
  isLoading,
  error,
  onLogin,
  onGoogleLogin,
}: LoginPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-transparent px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-xl lg:grid-cols-2">
        <div className="hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-100">
              Cameyo Admin
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight">
              Administración central de usuarios y técnicos
            </h1>
            <p className="mt-4 text-indigo-100">
              Panel web para gestionar acceso, validación y seguimiento del sistema,
              conectado al backend NestJS del proyecto.
            </p>
          </div>
          <p className="text-xs text-indigo-200">
            Login seguro con correo/contraseña o Google OAuth.
          </p>
        </div>

        <div className="p-8 sm:p-10">
          <div className="mx-auto w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-900">Iniciar sesión</h2>
            <p className="mt-2 text-sm text-slate-500">
              Usa una cuenta con rol ADMIN o MODERATOR.
            </p>

            {error ? (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6">
              <LoginForm isLoading={isLoading} onSubmit={onLogin} />
            </div>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs uppercase tracking-wide text-slate-400">
                o continuar con
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Button
              variant="secondary"
              className="w-full"
              isLoading={isLoading}
              onClick={() => {
                void onGoogleLogin();
              }}
            >
              Google OAuth
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
