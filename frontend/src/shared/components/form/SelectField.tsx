import type { SelectHTMLAttributes } from 'react'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/lib/utils'

/**
 * Campo de seleção compartilhado — mesmo padrão visual de `FormField` (label + erro), para os
 * casos em que o campo é uma referência a outra entidade (ex. Empresa em Conta Bancária, Conta
 * Bancária em Cartão de Crédito) em vez de texto livre.
 */
export function SelectField({
  id,
  label,
  error,
  placeholder,
  options,
  className,
  ...selectProps
}: {
  id: string
  label: string
  error?: string
  placeholder: string
  options: { value: string; label: string }[]
  className?: string
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'>) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 md:text-sm dark:bg-input/30"
        {...selectProps}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
