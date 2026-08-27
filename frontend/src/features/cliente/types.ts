/** Espelha `ClienteResponse`/`ClienteRequest` (backend). Cadastro simples: só `nome`. */
export interface Cliente {
  id: string
  nome: string
}

export interface ClienteFormValues {
  nome: string
}
