/**
 * Espelha `ParcelaResponse` (backend). Ver `docs/domain-model/21-parcela.md`. Sem `status` (D11,
 * `decisions.md` decisão #32) — o "estado" é sempre calculado em consulta a partir de
 * `vencimento` e `lancamentoFinanceiroId`, nunca persistido.
 */
export interface Parcela {
  id: string
  origem: 'Compra Cartão' | 'Contrato Financeiro'
  compraCartaoId: string | null
  contratoFinanceiroId: string | null
  numero: number
  total: number
  valor: number
  vencimento: string
  faturaId: string | null
  lancamentoFinanceiroId: string | null
}
