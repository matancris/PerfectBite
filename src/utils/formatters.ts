export function formatCurrency(amount: number, currency = 'ILS'): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('he-IL', options ?? {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('he-IL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatPhone(phone: string): string {
  // Format Israeli phone number
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}${cleaned.slice(6)}`
  }
  return phone
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'ממתין',
    confirmed: 'אושר',
    preparing: 'בהכנה',
    ready: 'מוכן',
    completed: 'הושלם',
    cancelled: 'בוטל',
  }
  return labels[status] ?? status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'warning',
    confirmed: 'info',
    preparing: 'info',
    ready: 'success',
    completed: 'success',
    cancelled: 'danger',
  }
  return colors[status] ?? 'secondary'
}
