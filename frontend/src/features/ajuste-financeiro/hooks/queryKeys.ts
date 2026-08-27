/** Chave local, não compartilhada — nenhuma outra feature precisa ler Ajuste Financeiro como referência. */
export const ajusteFinanceiroKeys = {
  all: ['ajustes-financeiros'] as const,
  list: (lancamentoOriginalId?: string) => ['ajustes-financeiros', { lancamentoOriginalId }] as const,
}
