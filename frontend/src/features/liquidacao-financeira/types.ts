/**
 * Espelha `AplicacaoItemResponse`/`AplicacaoItemRequest` (backend). `AplicaçãoDeLiquidação`
 * não tem endpoint HTTP próprio — nasce só como parte da criação de uma Liquidação
 * (`docs/domain-model/11-aplicacao-de-liquidacao.md`, Seção 1; confirmado no código:
 * `LiquidacaoFinanceiraService.criar` grava as Aplicações na mesma transação, sem Controller
 * dedicado). Por isso não existe `features/aplicacao-liquidacao/` — só estes tipos, embutidos
 * aqui.
 */
export interface AplicacaoItem {
  id: string
  lancamentoFinanceiroId: string
  valorAplicado: number
}

export interface AplicacaoItemValues {
  lancamentoFinanceiroId: string
  valorAplicado: number
}

/**
 * Espelha `LiquidacaoFinanceiraResponse` (backend). Ver
 * `docs/domain-model/10-liquidacao-financeira.md` — imutável desde a criação (D12), sem
 * nenhum campo editável depois de criada.
 */
export interface LiquidacaoFinanceira {
  id: string
  tipo: 'Pagamento' | 'Recebimento'
  dataEfetiva: string
  valor: number
  contaBancariaId: string
  aplicacoes: AplicacaoItem[]
}

/** Espelha `CriarLiquidacaoFinanceiraRequest` (backend) — único caso de uso de escrita (sem `atualizar`). */
export interface LiquidacaoCriarValues {
  tipo: 'Pagamento' | 'Recebimento'
  dataEfetiva: string
  valor: number
  contaBancariaId: string
  aplicacoes: AplicacaoItemValues[]
}
