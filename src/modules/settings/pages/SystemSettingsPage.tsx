import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

interface SettingsFormState {
  supportEmail: string;
  defaultCity: string;
  requestsPerPage: string;
  maintenanceMode: 'OFF' | 'ON';
}

const initialSettings: SettingsFormState = {
  supportEmail: 'soporte@cameyo.com',
  defaultCity: 'Bogota',
  requestsPerPage: '20',
  maintenanceMode: 'OFF',
};

export function SystemSettingsPage() {
  const [settings, setSettings] = useState<SettingsFormState>(initialSettings);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSave = (): void => {
    setFeedback('Configuración del sistema actualizada.');
  };

  return (
    <div className="space-y-4">
      {feedback ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {feedback}
        </div>
      ) : null}

      <Card title="Configuración del sistema" subtitle="Parámetros operativos del panel administrativo">
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Correo de soporte"
            value={settings.supportEmail}
            onChange={(event) =>
              setSettings((previous) => ({ ...previous, supportEmail: event.target.value }))
            }
          />

          <Input
            label="Ciudad por defecto"
            value={settings.defaultCity}
            onChange={(event) =>
              setSettings((previous) => ({ ...previous, defaultCity: event.target.value }))
            }
          />

          <Input
            label="Solicitudes por página"
            type="number"
            min={5}
            max={100}
            value={settings.requestsPerPage}
            onChange={(event) =>
              setSettings((previous) => ({ ...previous, requestsPerPage: event.target.value }))
            }
          />

          <Select
            label="Modo mantenimiento"
            value={settings.maintenanceMode}
            onChange={(event) =>
              setSettings((previous) => ({
                ...previous,
                maintenanceMode: event.target.value as 'OFF' | 'ON',
              }))
            }
            options={[
              { value: 'OFF', label: 'Desactivado' },
              { value: 'ON', label: 'Activado' },
            ]}
          />
        </div>

        <div className="mt-4">
          <Button onClick={handleSave}>Guardar configuración</Button>
        </div>
      </Card>
    </div>
  );
}
