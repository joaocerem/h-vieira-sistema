/**
 * Espelha `AjusteFinanceiroResponse` (backend). Ver `docs/domain-model/15-ajuste-financeiro.md`
 * — imutável desde a criação (D13, `decisions.md` decisão #34), sem exclusão física. O
 * Lançamento de ajuste (`lancamentoAjusteId`) **não é criado por este módulo** — precisa já
 * existir (criado via `features/lancamento-financeiro/`, origem "Manual") antes de formalizar
 * o vínculo aqui (`AjusteFinanceiroService`, comentário do backend).
 */
export interface AjusteFinanceiro {
  id: string
  lancamentoOriginalId: string
  lancamentoAjusteId: string
  tipoAjuste: TipoAjuste
  valor: number
  data: string
  usuarioId: string
  observacao: string | null
}

export type TipoAjuste = 'Estorno' | 'Reembolso' | 'Crédito' | 'Ajuste'

/** Espelha `CriarAjusteFinanceiroRequest` (backend) — único caso de uso de escrita (sem `atualizar`). */
export interface AjusteFinanceiroCriarValues {
  lancamentoOriginalId: string
  lancamentoAjusteId: string
  tipoAjuste: TipoAjuste
  valor: number
  data: string
  usuarioId: string
  observacao: string | null
}
