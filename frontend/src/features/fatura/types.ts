/**
 * Espelha `FaturaResponse` (backend). Ver `docs/domain-model/19-fatura.md`. Sem `atualizar` —
 * `valorTotalCalculado`/`valorCobrado` ficam congelados desde o fechamento do ciclo (fato
 * histórico, princípio 5/7 de modelagem).
 */
export interface Fatura {
  id: string
  cartaoId: string
  ciclo: string
  valorTotalCalculado: number
  valorCobrado: number
  liquidacaoFinanceiraId: string | null
}

/** Espelha `FecharCicloFaturaRequest` (backend). `ciclo` no formato `AAAA-MM`. */
export interface FecharCicloValues {
  cartaoId: string
  ciclo: string
  valorCobrado: number
}

/** Espelha `PagarFaturaRequest` (backend). */
export interface PagarFaturaValues {
  contaBancariaId: string
  dataEfetiva: string
}
