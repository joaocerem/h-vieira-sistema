/**
 * Espelha `VeiculoResponse` (backend). Ver `docs/domain-model/07-veiculo.md`. `tipo` tem
 * lista fechada de 8 valores (D10, `decisions.md` decisão #31) — diferente de
 * `Categoria.tipo`/`Usuario.situacaoDeAcesso`, que são texto livre por decisão explícita.
 */
export const TIPOS_VEICULO = [
  'Caminhão',
  'Escavadeira',
  'Pá carregadeira',
  'Trator',
  'Rolo compactador',
  'Veículo leve',
  'Terceiro',
  'Outro',
] as const

export type TipoVeiculo = (typeof TIPOS_VEICULO)[number]

export interface Veiculo {
  id: string
  empresaId: string
  nomeIdentificacao: string
  tipo: TipoVeiculo
  obraAtualId: string | null
}

/** `empresaId` só existe na criação — imutável depois (`AtualizarVeiculoRequest` não tem esse campo). */
export interface VeiculoCriarValues {
  empresaId: string
  nomeIdentificacao: string
  tipo: TipoVeiculo
  obraAtualId: string | null
}

export interface VeiculoAtualizarValues {
  nomeIdentificacao: string
  tipo: TipoVeiculo
  obraAtualId: string | null
}
