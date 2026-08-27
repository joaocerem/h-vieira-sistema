import type { ReactNode } from 'react'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/lib/utils'

/**
 * Campo de formulário compartilhado — label + slot de input + mensagem de erro, no padrão
 * visual único usado por todo formulário da aplicação. Usado com `react-hook-form` (biblioteca
 * de formulário é decisão de detalhe de implementação, não arquitetural — ver
 * `docs/architecture/arquitetura-tecnica-frontend.md`, Seção 13), nunca acoplado a uma feature
 * específica.
 */
export function FormField({
  id,
  label,
  error,
  children,
  className,
}: {
  id: string
  label: string
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
