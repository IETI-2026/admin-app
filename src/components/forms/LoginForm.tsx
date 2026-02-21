import { useMemo, useState } from 'react';
import type { LoginPayload } from '../../types/api';
import { Button } from '../ui/button';
import { Input } from '../ui/Input';

interface LoginFormProps {
  isLoading: boolean;
  onSubmit: (payload: LoginPayload) => Promise<void>;
}

export function LoginForm({ isLoading, onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  const errors = useMemo(() => {
    const nextErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      nextErrors.email = 'El correo es obligatorio.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = 'Ingresa un correo válido.';
    }

    if (!password.trim()) {
      nextErrors.password = 'La contraseña es obligatoria.';
    } else if (password.length < 8) {
      nextErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    }

    return nextErrors;
  }, [email, password]);

  const hasErrors = Boolean(errors.email || errors.password);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    if (hasErrors) {
      return;
    }

    await onSubmit({
      email: email.trim(),
      password,
    });
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Input
        label="Correo electrónico"
        type="email"
        placeholder="juan.perez@cameyo.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={touched ? errors.email : undefined}
      />

      <Input
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={touched ? errors.password : undefined}
      />

      <Button type="submit" isLoading={isLoading}>
        Iniciar sesión
      </Button>
    </form>
  );
}
