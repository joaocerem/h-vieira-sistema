import { Link, useSearchParams } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { SelectField } from '@/shared/components/form/SelectField'
import { useLancamentoOptions } from '@/shared/hooks/useLancamentoOptions'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import { useAjustesFinanceiros } from '../hooks/useAjustesFinanceiros'
import { AjusteFinanceiroTable } from '../components/AjusteFinanceiroTable'

/**
 * Filtro por Lançamento original sincronizado com a URL (`?lancamentoOriginalId=`) — permite que
 * `LancamentoTable` (`features/lancamento-financeiro/`) linke diretamente para "ver os ajustes
 * deste lançamento" (`/ajustes-financeiros?lancamentoOriginalId=<id>`), mesmo padrão já usado em
 * `ParcelaListPage`. O filtro atual é carregado adiante para "Novo ajuste", pré-selecionando o
 * Lançamento original no formulário.
 */
export function AjusteFinanceiroListPage() {
  const [searchParams] = useSearchParams()
  const lancamentoOriginalId = searchParams.get('lancamentoOriginalId') ?? ''

  const { data: lancamentos } = useLancamentoOptions()
  const {
    data: ajustes,
    isLoading,
    isError,
  } = useAjustesFinanceiros(lancamentoOriginalId || undefined)

  const lancamentoFiltrado = lancamentos?.find((l) => l.id === lancamentoOriginalId)

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Ajustes Financeiros</h1>
        <Button asChild>
          <Link
            to={
              lancamentoOriginalId
                ? `/ajustes-financeiros/novo?lancamentoOriginalId=${lancamentoOriginalId}`
                : '/ajustes-financeiros/novo'
            }
          >
            Novo ajuste
          </Link>
        </Button>
      </div>

      {lancamentoOriginalId && (
        <div className="grid gap-1.5 max-w-sm">
          <SelectField
            id="filtro-lancamento"
            label="Filtrando pelo lançamento original"
            placeholder="Todos os lançamentos"
            options={
              lancamentoFiltrado
                ? [
                    {
                      value: lancamentoFiltrado.id,
                      label: `${lancamentoFiltrado.tipo} • ${formatCurrency(lancamentoFiltrado.valor)} • vence ${formatDate(lancamentoFiltrado.vencimento)}`,
                    },
                  ]
                : []
            }
            value={lancamentoOriginalId}
            disabled
          />
          <Link to="/ajustes-financeiros" className="text-sm text-primary underline-offset-4 hover:underline">
            Limpar filtro
          </Link>
        </div>
      )}

      {isLoading && (
        <div className="grid gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-muted-foreground">Não foi possível carregar os ajustes financeiros.</p>
      )}

      {Array.isArray(ajustes) && <AjusteFinanceiroTable ajustes={ajustes} />}
    </div>
  )
}
