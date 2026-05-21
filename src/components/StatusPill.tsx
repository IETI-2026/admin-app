interface StatusPillProps {
  value?: string | null
}

const normalizeStatusClass = (value?: string | null): string => {
  const status = (value ?? 'UNKNOWN').toUpperCase()

  if (status.includes('PENDING')) {
    return 'status-pill status-pending'
  }

  if (status.includes('APPROV')) {
    return 'status-pill status-approved'
  }

  if (status.includes('REJECT')) {
    return 'status-pill status-rejected'
  }

  return 'status-pill status-neutral'
}

export const StatusPill = ({ value }: StatusPillProps) => {
  return <span className={normalizeStatusClass(value)}>{value ?? 'UNKNOWN'}</span>
}
