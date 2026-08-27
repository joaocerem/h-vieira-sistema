/**
 * Espelha `ContratoFinanceiroResponse` (backend). Ver `docs/domain-model/20-contrato-financeiro.md`.
 * `taxa` só existe quando `tipo` = Financiamento; `grupoCota`/`contemplado`/`veiculoId` só
 * quando `tipo` = Consórcio — conceitualmente inexistentes no outro caso, não apenas vazios
 * (decisão 4, `decisions.md`).
 */
export interface ContratoFinanceiro {
  id: string
  tipo: TipoContrato
  empresaId: string
  contaBancariaId: string
  fornecedorId: string
  valorContratado: number
  numeroParcelas: number
  dataVencimentoPrimeiraParcela: string
  taxa: number | null
  grupoCota: string | null
  contemplado: boolean | null
  veiculoId: string | null
}

export type TipoContrato = 'Financiamento' | 'Consórcio'

/**
 * Espelha `CriarContratoFinanceiroRequest` (backend). Ao criar, o backend gera automaticamente
 * as `numeroParcelas` Parcelas do parcelamento (decisão #40, mesma fórmula da decisão #39).
 * `contemplado` pode já nascer `true` (um Consórcio pode ser cadastrado já contemplado) — a
 * ação dedicada `contemplar` é só para a transição Não → Sim depois de já cadastrado.
 */
export interface ContratoFinanceiroCriarValues {
  tipo: TipoContrato
  empresaId: string
  contaBancariaId: string
  fornecedorId: string
  valorContratado: number
  numeroParcelas: number
  dataVencimentoPrimeiraParcela: string
  taxa: number | null
  grupoCota: string | null
  contemplado: boolean | null
  veiculoId: string | null
}

/**
 * Espelha `AtualizarContratoFinanceiroRequest` (backend) — sem `tipo`, `empresaId`,
 * `contaBancariaId`, `valorContratado`, `numeroParcelas` e `dataVencimentoPrimeiraParcela`,
 * imutáveis desde a criação. `veiculoId` só é aceito pelo backend quando `tipo` = Consórcio e
 * `contemplado` = true (`ContratoFinanceiroService#atualizar`).
 */
export interface ContratoFinanceiroAtualizarValues {
  fornecedorId: string
  veiculoId: string | null
}
