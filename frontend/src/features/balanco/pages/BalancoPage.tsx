import { useState } from 'react'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { SelectField } from '@/shared/components/form/SelectField'
import { useEmpresaOptions } from '@/shared/hooks/useEmpresaOptions'
import { useBalanco } from '../hooks/useBalanco'
import { ResultadoCard } from '../components/ResultadoCard'

/**
 * Só leitura/agregação (`BalancoController`, único endpoint `GET /api/balanco`) — sem
 * criar/editar/excluir, sem tabela, sem paginação. `empresaId` opcional filtra por Empresa;
 * omitido, soma todas (mesmo comportamento do backend).
 */
export function BalancoPage() {
  const [empresaId, setEmpresaId] = useState('')
  const { data: empresas } = useEmpresaOptions()
  const { data: balanco, isLoading, isError } = useBalanco(empresaId || undefined)

  return (
    <div className="grid gap-6">
      <h1 className="text-lg font-semibold">Balanço</h1>

      <SelectField
        id="filtro-empresa"
        label="Filtrar por empresa"
        placeholder="Todas as empresas"
        options={(empresas ?? []).map((empresa) => ({ value: empresa.id, label: empresa.nome }))}
        value={empresaId}
        onChange={(event) => setEmpresaId(event.target.value)}
        className="max-w-xs"
      />

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {isError && <p className="text-sm text-muted-foreground">Não foi possível carregar o balanço.</p>}

      {balanco && (
        <>
          <section className="grid gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Realizado — fração já coberta por Liquidação/Aplicação
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ResultadoCard label="Receitas realizadas" valor={balanco.receitasRealizadas} />
              <ResultadoCard label="Despesas realizadas" valor={balanco.despesasRealizadas} />
              <ResultadoCard label="Resultado realizado" valor={balanco.resultadoRealizado} destaque />
            </div>
          </section>

          <section className="grid gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Projetado — Lançamentos Aberto + Parcial + Pago (exceto Cancelado)
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ResultadoCard label="Receitas projetadas" valor={balanco.receitasProjetadas} />
              <ResultadoCard label="Despesas projetadas" valor={balanco.despesasProjetadas} />
              <ResultadoCard label="Resultado projetado" valor={balanco.resultadoProjetado} destaque />
            </div>
          </section>
        </>
      )}
    </div>
  )
}
