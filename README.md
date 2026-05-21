# Admin App MVP

Cliente web de administración para revisión documental de proveedores, con autenticación JWT y control por rol (`ADMIN`, `MODERATOR`).

## Funcionalidad implementada

- Login de usuarios administrativos.
- Validación de perfil con `GET /api/auth/me` y bloqueo por rol.
- Bandeja de revisión documental con filtros por estado y paginación.
- Detalle por proveedor con consulta de documentos.
- Aprobación y rechazo de documentos (rechazo con motivo opcional).
- Consulta opcional de estado final del proveedor (`provider-profile`).
- Creación de cuentas `ADMIN` y `MODERATOR`.
- Manejo centralizado de errores `401`, `403`, `404` y errores generales.
- Manejo de sesión con token en memoria + fallback a `localStorage`.
- Refresh de sesión opcional con `POST /api/auth/refresh`.

## Stack

- React 19 + TypeScript + Vite
- React Router DOM
- TanStack Query
- Axios con interceptores

## Variables de entorno

Crear un archivo `.env` basado en `.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_API_PREFIX=/api
VITE_TENANT_ID=public
VITE_AUTH_STORAGE_KEY=cameyo_admin_session
VITE_REQUEST_TIMEOUT_MS=15000
```

## Ejecución local

```bash
npm install
npm run dev
```

Build y validación:

```bash
npm run build
npm run lint
```

## Rutas de la app

- `/login`
- `/review-queue`
- `/providers/:providerUserId`
- `/admin/users/new` (solo rol `ADMIN`)

## Endpoints consumidos

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users/admin/provider-review-queue?page=0&limit=20&status=PENDING_REVIEW`
- `GET /api/users/:providerUserId/provider-documents`
- `PATCH /api/users/:providerUserId/provider-documents/:documentId/decision`
- `POST /api/users/admin`
- Opcionales:
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
  - `GET /api/users/:providerUserId/provider-profile`

Headers enviados en todas las llamadas:

- `Authorization: Bearer <token>`
- `X-Tenant-ID: public` (configurable por `VITE_TENANT_ID`)

## Nota sobre creación de administradores

El formulario envía `passwordHash` como campo opcional, tal como está definido en el contrato actual. Si backend migra a `password` en texto plano para hash en servidor, se debe ajustar ese payload.
