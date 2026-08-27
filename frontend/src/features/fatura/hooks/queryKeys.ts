/** Chave local, não compartilhada — nenhuma outra feature precisa ler a lista de Faturas como referência (mesmo caso de `liquidacaoFinanceiraKeys` antes da Conciliação Bancária existir). */
export const faturaKeys = {
  all: ['faturas'] as const,
  detail: (id: string) => ['faturas', id] as const,
}
