/**
 * Chaves de query compartilhadas entre features — só para listas consumidas como referência
 * por mais de um módulo (ex. Empresa, usada pelo formulário de Conta Bancária; Categoria,
 * Fornecedor e Cliente, usados pelo formulário de Lançamento Financeiro; Lançamento
 * Financeiro, usado pelo formulário de Liquidação Financeira). Cada feature usa isso como
 * fonte única da sua própria chave (`features/<modulo>/hooks/queryKeys.ts`), garantindo que a
 * leitura de referência em outra feature compartilhe o mesmo cache — nunca duas chaves
 * parecidas por acidente. Chaves usadas só dentro de uma única feature continuam definidas
 * localmente.
 */
export const sharedQueryKeys = {
  empresas: ['empresas'] as const,
  contasBancarias: ['contas-bancarias'] as const,
  categorias: ['categorias'] as const,
  fornecedores: ['fornecedores'] as const,
  clientes: ['clientes'] as const,
  lancamentosFinanceiros: ['lancamentos-financeiros'] as const,
  obras: ['obras'] as const,
  veiculos: ['veiculos'] as const,
  liquidacoesFinanceiras: ['liquidacoes-financeiras'] as const,
  movimentacoesBancarias: ['movimentacoes-bancarias'] as const,
  vinculosConciliacao: ['vinculos-conciliacao'] as const,
  cartoesCredito: ['cartoes-credito'] as const,
  comprasCartao: ['compras-cartao'] as const,
  parcelas: ['parcelas'] as const,
  contratosFinanceiros: ['contratos-financeiros'] as const,
  usuarios: ['usuarios'] as const,
}
