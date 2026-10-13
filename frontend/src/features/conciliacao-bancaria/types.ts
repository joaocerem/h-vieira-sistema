/**
 * Espelha `MovimentacaoBancariaResponse` (backend). Ver
 * `docs/domain-model/12-movimentacao-bancaria.md` — fato puro do extrato; só `classificacao` é
 * alterável depois de criada (`data`/`descricao`/`valor`/`contaBancariaId` são fatos do
 * extrato, sem mecanismo de edição).
 */
export interface MovimentacaoBancaria {
  id: string
  contaBancariaId: string
  data: string
  descricao: string
  valor: number
  classificacao: Classificacao
}

export type Classificacao =
  | 'Terraplanagem'
  | 'Fora da Operação'
  | 'Transferência Interna'
  | 'Retirada do Patrão'
  | 'Não Classificada'

/**
 * Espelha `ItemImportacaoMovimentacaoRequest` (backend). Sem `criar` livre — Movimentação só
 * nasce por importação em lote (este formulário) ou automaticamente ao registrar uma
 * Liquidação (sem tela própria — mesma transação no backend).
 */
export interface ItemImportacaoMovimentacaoValues {
  data: string
  descricao: string
  valor: number
}

/** Espelha `ImportarMovimentacoesRequest` (backend). */
export interface ImportarMovimentacoesValues {
  contaBancariaId: string
  itens: ItemImportacaoMovimentacaoValues[]
}

/**
 * Espelha `VinculoConciliacaoResponse` (backend). Ver
 * `docs/domain-model/14-vinculo-conciliacao.md` — toda Movimentação tem exatamente um Vínculo
 * (1:1 obrigatório, gerado automaticamente); sem tela própria de criação — reflexo direto
 * dessa regra, não uma omissão.
 *
 * `lancamentosFinanceirosIds` (Sprint 3 — rodada de evolução operacional) — substitui
 * `liquidacaoFinanceiraId`; N:N direto com Lançamento Financeiro — um Vínculo pode cobrir um
 * ou mais Lançamentos de uma vez (ex. pagamento de fatura de cartão cobrindo várias Parcelas).
 */
export interface VinculoConciliacao {
  id: string
  movimentacaoBancariaId: string
  lancamentosFinanceirosIds: string[]
  estadoConciliacao: EstadoConciliacao
}

export type EstadoConciliacao =
  | 'Não Vinculado'
  | 'Sugerido'
  | 'Confirmado'
  | 'Divergente'
  | 'Sem Correspondência'

/**
 * Espelha `VinculoConciliacaoService.ResultadoSugestaoAutomatica` (backend). `comMultiplosCandidatos`
 * (Sprint 3) — Vínculos com dois ou mais candidatos igualmente compatíveis, deixados em
 * `Não Vinculado` para o usuário resolver manualmente (o sistema nunca escolhe sozinho).
 */
export interface ResultadoSugestaoAutomatica {
  processados: number
  sugeridos: number
  semCorrespondencia: number
  comMultiplosCandidatos: number
}

/**
 * Espelha `TransferenciaInternaResponse` (backend). Ver
 * `docs/domain-model/13-transferencia-interna.md` — nunca gera `LANÇAMENTO_FINANCEIRO`; sem
 * `atualizar` — "Regras de alteração: não definidas" no documento de domínio.
 */
export interface TransferenciaInterna {
  id: string
  movimentacaoOrigemId: string
  movimentacaoDestinoId: string
  valor: number
  data: string
}

/** Espelha `CriarTransferenciaInternaRequest` (backend). */
export interface TransferenciaInternaCriarValues {
  movimentacaoOrigemId: string
  movimentacaoDestinoId: string
  valor: number
  data: string
}
