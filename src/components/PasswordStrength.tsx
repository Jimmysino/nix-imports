import { checkPassword, getPasswordStrength } from '../utils/password'

interface Props {
  password: string
}

const rules = [
  { key: 'length' as const, label: 'Mínimo 8 caracteres' },
  { key: 'uppercase' as const, label: 'Una letra mayúscula' },
  { key: 'lowercase' as const, label: 'Una letra minúscula' },
  { key: 'number' as const, label: 'Un número' },
  { key: 'special' as const, label: 'Un carácter especial' },
]

export function PasswordStrength({ password }: Props) {
  if (!password) return null

  const checks = checkPassword(password)
  const strength = getPasswordStrength(password)

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${strength.percent}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-500 w-20 text-right">{strength.label}</span>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        {rules.map(({ key, label }) => (
          <li key={key} className={`text-xs flex items-center gap-1.5 ${checks[key] ? 'text-green-600' : 'text-gray-400'}`}>
            <span>{checks[key] ? '✓' : '○'}</span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  )
}
