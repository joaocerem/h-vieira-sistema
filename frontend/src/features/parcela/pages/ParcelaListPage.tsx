import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { SelectField } from '@/shared/components/form/SelectField'
import { useCompraCartaoOptions } from '@/shared/hooks/useCompraCartaoOptions'
import { useContratoFinanceiroOptions } from '@/shared/hooks/useContratoFinanceiroOptions'
import { useFornecedorOptions } from '@/shared/hooks/useFornecedorOptions'
import { useParcelas } from '../hooks/useParcelas'
import { useGerarLancamentoParcela } from '../hooks/useGerarLancamentoParcela'
import { ParcelaTable } from '../components/ParcelaTable'

/**
 * Dois filtros reais, mutuamente exclusivos (mesma regra de `ParcelaController#listarTodas`),
 * sincronizados com a URL (`?compraCartaoId=`/`?contratoFinanceiroId=`) — permite que
 * `CompraCartaoTable`/`ContratoFinanceiroTable` linkem diretamente para "ver as parcelas desta
 * origem", sem duplicar essa tela lá. Sem filtro por Fatura — o backend não expõe esse
 * parâmetro em `GET /api/parcelas`; `features/fatura/` resolve isso lendo a lista completa
 * (`useParcelaOptions`) e cruzando por `faturaId` no cliente.
 */
export function ParcelaListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const compraCartaoId = searchParams.get('compraCartaoId') ?? ''
  const contratoFinanceiroId = searchParams.get('contratoFinanceiroId') ?? ''

  const { data: comprasCartao } = useCompraCartaoOptions()
  const { data: contratosFinanceiros } = useContratoFinanceiroOptions()
  const { data: fornecedores } = useFornecedorOptions()
  const {
    data: parcelas,
    isLoading,
    isError,
  } = useParcelas({
    compraCartaoId: compraCartaoId || undefined,
    contratoFinanceiroId: contratoFinanceiroId || undefined,
  })
  const gerarLancamento = useGerarLancamentoParcela()

  function handleGerarLancamento(id: string) {
    gerarLancamento.mutate(id, {
      onSuccess: () => toast.success('Lançamento gerado a partir da Parcela.'),
      // Erro (ex. Compra não Terraplanagem) já aparece no toast global (QueryProvider).
    })
  }

  const opcoesCompra = (comprasCartao ?? []).map((compra) => {
    const fornecedor = fornecedores?.find((f) => f.id === compra.fornecedorId)
    return { value: compra.id, label: `${fornecedor?.nome ?? compra.id} — ${compra.numeroParcelas}x` }
  })

  const opcoesContrato = (contratosFinanceiros ?? []).map((contrato) => {
    const fornecedor = fornecedores?.find((f) => f.id === contrato.fornecedorId)
    return { value: contrato.id, label: `${contrato.tipo} — ${fornecedor?.nome ?? contrato.id}` }
  })

  return (
    <div className="grid gap-4">
      <h1 className="text-lg font-semibold">Parcelas</h1>

      <div className="grid max-w-2xl grid-cols-2 gap-4">
        <SelectField
          id="filtro-compra-cartao"
          label="Filtrar por compra de cartão"
          placeholder="Todas as compras"
          options={opcoesCompra}
          value={compraCartaoId}
          onChange={(event) => {
            const valor = event.target.value
            setSearchParams(valor ? { compraCartaoId: valor } : {})
          }}
        />

        <SelectField
          id="filtro-contrato-financeiro"
          label="Filtrar por contrato financeiro"
          placeholder="Todos os contratos"
          options={opcoesContrato}
          value={contratoFinanceiroId}
          onChange={(event) => {
            const valor = event.target.value
            setSearchParams(valor ? { contratoFinanceiroId: valor } : {})
          }}
        />
      </div>

      {isLoading && (
        <div className="grid gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}

      {isError && <p className="text-sm text-muted-foreground">Não foi possível carregar as parcelas.</p>}

      {Array.isArray(parcelas) && (
        <ParcelaTable
          parcelas={parcelas}
          onGerarLancamento={handleGerarLancamento}
          isPending={gerarLancamento.isPending}
        />
      )}
    </div>
  )
}
