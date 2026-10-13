/**
 * Espelha `BalancoResponse` (backend). Ver `docs/architecture/arquitetura-conceitual.md`,
 * regra 8 (Seção 2). Só leitura/agregação — sem entidade própria
 * (`arquitetura-tecnica.md`, Seção 2), nunca lê `MOVIMENTAÇÃO_BANCÁRIA` diretamente.
 *
 * A partir da Sprint 3 (rodada de evolução operacional):
 * - **Realizado**: soma dos `LANÇAMENTO_FINANCEIRO` ligados a algum Vínculo Conciliação
 *   `Confirmado` (substitui a soma por `APLICAÇÃO_DE_LIQUIDAÇÃO`, removida junto com
 *   Liquidação Financeira).
 * - **Projetado**: soma de `LANÇAMENTO_FINANCEIRO` por completo (todos os Ativos, conciliados
 *   ou não).
 */
export interface Balanco {
  receitasRealizadas: number
  despesasRealizadas: number
  resultadoRealizado: number
  receitasProjetadas: number
  despesasProjetadas: number
  resultadoProjetado: number
}
