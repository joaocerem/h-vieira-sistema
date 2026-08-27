/**
 * Espelha `CompraCartaoResponse` (backend). Ver `docs/domain-model/18-compra-cartao.md`. Sem
 * relação direta com Fatura — só transitiva, via `Parcela` (`features/parcela/`).
 */
export interface CompraCartao {
  id: string
  cartaoId: string
  fornecedorId: string
  valor: number
  data: string
  categoriaId: string
  classificacao: Classificacao
  obraId: string | null
  veiculoId: string | null
  numeroParcelas: number
}

export type Classificacao =
  | 'Terraplanagem'
  | 'Fora da Operação'
  | 'Transferência Interna'
  | 'Retirada do Patrão'
  | 'Não Classificada'

/**
 * Espelha `CriarCompraCartaoRequest` (backend). Ao criar, o backend gera automaticamente as
 * `numeroParcelas` Parcelas do parcelamento (decisão #39), na mesma transação.
 */
export interface CompraCartaoCriarValues {
  cartaoId: string
  fornecedorId: string
  valor: number
  data: string
  categoriaId: string
  classificacao: Classificacao
  obraId: string | null
  veiculoId: string | null
  numeroParcelas: number
}

/**
 * Espelha `AtualizarCompraCartaoRequest` (backend) — sem `cartaoId`, `valor` e `numeroParcelas`,
 * imutáveis desde a criação. Corrigir `categoriaId`/`obraId`/`veiculoId` propaga automaticamente
 * para os Lançamentos já gerados pelas Parcelas desta Compra, exceto os que já têm Rateio
 * vinculado (D5, `decisions.md` decisão #27).
 */
export interface CompraCartaoAtualizarValues {
  fornecedorId: string
  data: string
  categoriaId: string
  classificacao: Classificacao
  obraId: string | null
  veiculoId: string | null
}
