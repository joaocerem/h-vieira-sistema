/**
 * Espelha `ContaBancariaResponse` (backend). Sem campo de saldo — sempre calculado a partir de
 * Movimentação Bancária, nunca persistido (`docs/domain-model/08-conta-bancaria.md`). Sem
 * `apelido` (decisão de negócio, Sprint 3 — rodada de evolução operacional): identificação
 * passa a ser Empresa + Banco.
 */
export interface ContaBancaria {
  id: string
  empresaId: string
  banco: string
}

/**
 * `empresaId` só existe na criação — `AtualizarContaBancariaRequest` (backend) não tem esse
 * campo: reatribuir a Empresa de uma Conta Bancária já existente não é uma operação suportada
 * (ver `domain/contabancaria/ContaBancaria.java`, sem setter de `empresa`).
 */
export interface ContaBancariaCriarValues {
  empresaId: string
  banco: string
}

export interface ContaBancariaAtualizarValues {
  banco: string
}
