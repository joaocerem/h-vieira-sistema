import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { formatCurrency } from '@/shared/lib/formatters'
import { cn } from '@/shared/lib/utils'

/**
 * Extraído por reuso real — seis instâncias na mesma página (`BalancoPage`, três valores ×
 * Realizado/Projetado). Reaproveita `shared/components/ui/card` (shadcn/ui), até aqui só
 * cadastrado, nunca consumido por nenhuma feature — primeira tela genuinamente "dashboard" do
 * Frontend.
 */
export function ResultadoCard({
  label,
  valor,
  destaque = false,
}: {
  label: string
  valor: number
  destaque?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle
          className={cn(
            'text-lg',
            destaque && (valor >= 0 ? 'text-primary' : 'text-destructive'),
          )}
        >
          {formatCurrency(valor)}
        </CardTitle>
      </CardHeader>
    </Card>
  )
}
