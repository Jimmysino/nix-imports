export interface PasswordCheck {
  length: boolean
  uppercase: boolean
  lowercase: boolean
  number: boolean
  special: boolean
}

export function checkPassword(password: string): PasswordCheck {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
}

export function isPasswordValid(password: string): boolean {
  const c = checkPassword(password)
  return c.length && c.uppercase && c.lowercase && c.number && c.special
}

export function getPasswordStrength(password: string): { label: string; color: string; percent: number } {
  const c = checkPassword(password)
  const score = [c.length, c.uppercase, c.lowercase, c.number, c.special].filter(Boolean).length

  if (score <= 1) return { label: 'Muy débil', color: 'bg-red-500', percent: 20 }
  if (score === 2) return { label: 'Débil', color: 'bg-orange-500', percent: 40 }
  if (score === 3) return { label: 'Regular', color: 'bg-yellow-500', percent: 60 }
  if (score === 4) return { label: 'Fuerte', color: 'bg-blue-500', percent: 80 }
  return { label: 'Muy fuerte', color: 'bg-green-500', percent: 100 }
}
