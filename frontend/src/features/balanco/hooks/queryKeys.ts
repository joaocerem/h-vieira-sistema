/** Chave local, não compartilhada — nenhuma outra feature precisa ler o Balanço como referência. */
export const balancoKeys = {
  calcular: (empresaId?: string) => ['balanco', { empresaId }] as const,
}
