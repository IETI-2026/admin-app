import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createAdminUser } from '../api/adminApi'
import { getErrorMessage } from '../api/error'
import type { AllowedRole } from '../types/auth'

const ROLES: AllowedRole[] = ['ADMIN', 'MODERATOR']

export const CreateAdminPage = () => {
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<AllowedRole>('MODERATOR')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [passwordHash, setPasswordHash] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      setSuccessMessage('Usuario administrativo creado correctamente.')
      setFormError(null)
      setFullName('')
      setRole('MODERATOR')
      setEmail('')
      setPhoneNumber('')
      setPasswordHash('')
    },
    onError: (error) => {
      setSuccessMessage(null)
      setFormError(getErrorMessage(error))
    },
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!fullName.trim()) {
      setFormError('El nombre completo es obligatorio.')
      return
    }

    setFormError(null)

    await createMutation.mutateAsync({
      fullName: fullName.trim(),
      role,
      email: email.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      passwordHash: passwordHash.trim() || undefined,
    })
  }

  return (
    <section className="panel panel-narrow">
      <header className="panel-header">
        <div>
          <h2>Crear administrador o moderador</h2>
          <p>Completa los datos mínimos para registrar una cuenta administrativa.</p>
        </div>
      </header>

      {successMessage ? <article className="state-card success-state">{successMessage}</article> : null}
      {formError ? <article className="state-card error-state">{formError}</article> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <label htmlFor="full-name">Nombre completo *</label>
        <input
          id="full-name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Ejemplo: Laura Castaño"
        />

        <label htmlFor="role">Rol *</label>
        <select id="role" value={role} onChange={(event) => setRole(event.target.value as AllowedRole)}>
          {ROLES.map((roleOption) => (
            <option key={roleOption} value={roleOption}>
              {roleOption}
            </option>
          ))}
        </select>

        <label htmlFor="email">Correo</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="persona@empresa.com"
        />

        <label htmlFor="phone">Teléfono</label>
        <input
          id="phone"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          placeholder="+57 300 000 0000"
        />

        <label htmlFor="password-hash">passwordHash (opcional)</label>
        <input
          id="password-hash"
          value={passwordHash}
          onChange={(event) => setPasswordHash(event.target.value)}
          placeholder="Si backend requiere hash explícito"
        />

        <button type="submit" className="primary-button" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creando...' : 'Crear usuario'}
        </button>
      </form>
    </section>
  )
}
