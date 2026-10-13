/**
 * Espelha `CartaoCreditoResponse` (backend). Cadastro do cartão em si — não inclui Compra,
 * Parcela nem Fatura (módulo financeiro separado, fora desta etapa). Sem `apelido` (decisão de
 * negócio, Sprint 3 — rodada de evolução operacional): identificação passa a ser Empresa +
 * Banco (Empresa resolvida via `contaBancariaId`, não é campo direto deste cadastro).
 */
export interface CartaoCredito {
  id: string
  contaBancariaId: string
  banco: string
  diaFechamento: number
  diaVencimento: number
}

/** `contaBancariaId` só existe na criação — mesma regra de `ContaBancaria`/`Empresa`. */
export interface CartaoCreditoCriarValues {
  contaBancariaId: string
  banco: string
  diaFechamento: number
  diaVencimento: number
}

export interface CartaoCreditoAtualizarValues {
  banco: string
  diaFechamento: number
  diaVencimento: number
}
