import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/Input';
import { HttpError } from '../../../core/http/http-error';
import type { AdminLayoutContextValue } from '../../../layouts/admin-layout.context';
import { updateMyProfileRequest } from '../api/auth.api';

interface ProfilePageProps {
  onRefreshProfile: () => Promise<void>;
}

export function ProfilePage({ onRefreshProfile }: ProfilePageProps) {
  const { authState } = useOutletContext<AdminLayoutContextValue>();
  const user = authState.user;

  const initialValues = useMemo(
    () => ({
      fullName: user?.fullName ?? '',
      phoneNumber: user?.phoneNumber ?? '',
      profilePhotoUrl: user?.profilePhotoUrl ?? '',
    }),
    [user],
  );

  const [fullName, setFullName] = useState(initialValues.fullName);
  const [phoneNumber, setPhoneNumber] = useState(initialValues.phoneNumber);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(initialValues.profilePhotoUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFullName(initialValues.fullName);
    setPhoneNumber(initialValues.phoneNumber);
    setProfilePhotoUrl(initialValues.profilePhotoUrl);
  }, [initialValues]);

  const handleSave = async (): Promise<void> => {
    setFeedback(null);
    setError(null);
    setIsSaving(true);

    try {
      await updateMyProfileRequest({
        fullName: fullName.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        profilePhotoUrl: profilePhotoUrl.trim() || undefined,
      });
      await onRefreshProfile();
      setFeedback('Perfil actualizado correctamente.');
    } catch (requestError) {
      const message =
        requestError instanceof HttpError
          ? requestError.message
          : 'No se pudo actualizar el perfil.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
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

      <Card title="Mi Perfil" subtitle="Edita tus datos de administrador">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Nombre completo"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Administrador Cameyo"
          />

          <Input
            label="Teléfono"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="+57 300 000 0000"
          />

          <div className="md:col-span-2">
            <Input
              label="URL foto de perfil"
              value={profilePhotoUrl}
              onChange={(event) => setProfilePhotoUrl(event.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button isLoading={isSaving} onClick={() => void handleSave()}>
            Guardar cambios
          </Button>
        </div>
      </Card>
    </div>
  );
}
