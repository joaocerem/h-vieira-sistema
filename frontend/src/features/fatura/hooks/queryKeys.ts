/** Chave local, não compartilhada — nenhuma outra feature precisa ler a lista de Faturas como referência */
export const faturaKeys = {
  all: ['faturas'] as const,
  detail: (id: string) => ['faturas', id] as const,
}
