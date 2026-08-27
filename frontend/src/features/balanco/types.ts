/**
 * Espelha `BalancoResponse` (backend). Ver `docs/architecture/arquitetura-conceitual.md`,
 * regra 8 (Seção 2). Só leitura/agregação — sem entidade própria
 * (`arquitetura-tecnica.md`, Seção 2), nunca lê `MOVIMENTAÇÃO_BANCÁRIA` diretamente.
 *
 * - **Realizado**: soma da fração de `LANÇAMENTO_FINANCEIRO` já coberta por
 *   `APLICAÇÃO_DE_LIQUIDAÇÃO`.
 * - **Projetado**: soma de `LANÇAMENTO_FINANCEIRO` por completo (Aberto + Parcial + Pago,
 *   exceto Cancelado).
 */
export interface Balanco {
  receitasRealizadas: number
  despesasRealizadas: number
  resultadoRealizado: number
  receitasProjetadas: number
  despesasProjetadas: number
  resultadoProjetado: number
}
