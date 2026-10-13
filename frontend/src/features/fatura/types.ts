/**
 * Espelha `FaturaResponse` (backend). Ver `docs/domain-model/19-fatura.md`. Sem `atualizar` —
 * `valorTotalCalculado`/`valorCobrado` ficam congelados desde o fechamento do ciclo (fato
 * histórico, princípio 5/7 de modelagem).
 *
 * `paga` (decisão de negócio, Sprint 3 — rodada de evolução operacional): substitui
 * `liquidacaoFinanceiraId` — sem Liquidação Financeira, não existe mais ação "Pagar fatura".
 * Derivado pelo backend (`FaturaService#calcularPaga`, nunca persistido) — verdadeiro quando
 * todos os Lançamentos gerados pelas Parcelas do ciclo estão conciliados.
 */
export interface Fatura {
  id: string
  cartaoId: string
  ciclo: string
  valorTotalCalculado: number
  valorCobrado: number
  paga: boolean
}

/** Espelha `FecharCicloFaturaRequest` (backend). `ciclo` no formato `AAAA-MM`. */
export interface FecharCicloValues {
  cartaoId: string
  ciclo: string
  valorCobrado: number
}
