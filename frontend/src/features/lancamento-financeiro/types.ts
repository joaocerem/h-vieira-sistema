/**
 * Espelha `LancamentoFinanceiroResponse` (backend). Ver
 * `docs/domain-model/09-lancamento-financeiro.md`. `statusFinanceiro` é sempre calculado pelo
 * backend (nunca pelo Frontend) — o Frontend só exibe o valor já vindo pronto na resposta.
 */
export interface LancamentoFinanceiro {
  id: string
  tipo: 'Despesa' | 'Receita'
  empresaId: string
  categoriaId: string
  fornecedorId: string | null
  clienteId: string | null
  obraId: string | null
  veiculoId: string | null
  valor: number
  dataCompetencia: string
  vencimento: string
  situacaoAdministrativa: 'Ativo' | 'Cancelado'
  origem: string
  statusFinanceiro: string
  descricao: string | null
  documento: string | null
}

/**
 * Espelha `CriarLancamentoFinanceiroRequest` (backend). `origem` nunca é enviado pelo
 * Frontend — o endpoint de criação só aceita `origem` = "Manual", definido implicitamente
 * pelo próprio backend (`LancamentoFinanceiroService.criar`). `obraId`/`veiculoId` opcionais —
 * `veiculoId`, quando informado, precisa pertencer à mesma Empresa do Lançamento
 * (`LancamentoFinanceiroService.resolverEValidarObraEVeiculo`); o Frontend já filtra as
 * opções de Veículo por Empresa selecionada (`LancamentoForm.tsx`), mas quem valida de fato é
 * o backend.
 */
export interface LancamentoCriarValues {
  tipo: 'Despesa' | 'Receita'
  empresaId: string
  categoriaId: string
  fornecedorId: string | null
  clienteId: string | null
  obraId: string | null
  veiculoId: string | null
  valor: number
  dataCompetencia: string
  vencimento: string
  descricao: string | null
  documento: string | null
}

/** Espelha `AtualizarLancamentoFinanceiroRequest` (backend) — sem `tipo`, imutável. */
export interface LancamentoAtualizarValues {
  empresaId: string
  categoriaId: string
  fornecedorId: string | null
  clienteId: string | null
  obraId: string | null
  veiculoId: string | null
  valor: number
  dataCompetencia: string
  vencimento: string
  descricao: string | null
  documento: string | null
}
