import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { SelectField } from '@/shared/components/form/SelectField'
import { useLancamentos } from '../hooks/useLancamentos'
import { LancamentoTable } from '../components/LancamentoTable'

/**
 * "Contas a Pagar" (Despesa) e "Contas a Receber" (Receita) não são telas nem endpoints
 * próprios (Sprint 3 — rodada de evolução operacional): são a mesma listagem de Lançamento
 * Financeiro, filtrada no cliente por `tipo`/`statusFinanceiro` — nenhum dado nem regra de
 * negócio nova, só um recorte de visualização sobre os Lançamentos já cadastrados.
 */
export function LancamentoListPage() {
  const { data: lancamentos, isLoading, isError } = useLancamentos()
  const [tipo, setTipo] = useState('')
  const [status, setStatus] = useState('')

  const lancamentosFiltrados = useMemo(() => {
    if (!lancamentos) return lancamentos
    return lancamentos.filter(
      (lancamento) =>
        (tipo === '' || lancamento.tipo === tipo) &&
        (status === '' || lancamento.statusFinanceiro === status),
    )
  }, [lancamentos, tipo, status])

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Lançamentos Financeiros</h1>
        <Button asChild>
          <Link to="/lancamentos-financeiros/novo">Novo lançamento</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <SelectField
          id="filtro-tipo"
          label="Tipo"
          placeholder="Todos (Contas a Pagar e a Receber)"
          options={[
            { value: 'Despesa', label: 'Despesa (Contas a Pagar)' },
            { value: 'Receita', label: 'Receita (Contas a Receber)' },
          ]}
          value={tipo}
          onChange={(event) => setTipo(event.target.value)}
          className="max-w-xs"
        />
        <SelectField
          id="filtro-status"
          label="Status"
          placeholder="Todos"
          options={[
            { value: 'Não Conciliado', label: 'Não Conciliado' },
            { value: 'Conciliado', label: 'Conciliado' },
          ]}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="max-w-xs"
        />
      </div>

      {isLoading && (
        <div className="grid gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar os lançamentos financeiros.
        </p>
      )}

      {Array.isArray(lancamentosFiltrados) && <LancamentoTable lancamentos={lancamentosFiltrados} />}
    </div>
  )
}
