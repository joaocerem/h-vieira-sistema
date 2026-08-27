/** Espelha `FornecedorResponse`/`FornecedorRequest` (backend). Cadastro simples: só `nome`. */
export interface Fornecedor {
  id: string
  nome: string
}

export interface FornecedorFormValues {
  nome: string
}
