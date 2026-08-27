/**
 * Espelha `CartaoCreditoResponse` (backend). Cadastro do cartão em si — não inclui Compra,
 * Parcela nem Fatura (módulo financeiro separado, fora desta etapa).
 */
export interface CartaoCredito {
  id: string
  contaBancariaId: string
  banco: string
  apelido: string
  diaFechamento: number
  diaVencimento: number
}

/** `contaBancariaId` só existe na criação — mesma regra de `ContaBancaria`/`Empresa`. */
export interface CartaoCreditoCriarValues {
  contaBancariaId: string
  banco: string
  apelido: string
  diaFechamento: number
  diaVencimento: number
}

export interface CartaoCreditoAtualizarValues {
  banco: string
  apelido: string
  diaFechamento: number
  diaVencimento: number
}
