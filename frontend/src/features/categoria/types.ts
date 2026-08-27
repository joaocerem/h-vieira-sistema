/**
 * Espelha `CategoriaResponse`/`CategoriaRequest` (backend). `tipo` é texto livre — sem
 * enumeração fechada confirmada no domínio (`domain-model/06-categoria.md`, Decisão 5,
 * `decisions.md`); o backend não valida valores permitidos, e este formulário não inventa essa
 * regra também (input de texto, não `<select>`).
 */
export interface Categoria {
  id: string
  nome: string
  tipo: string
}

export interface CategoriaFormValues {
  nome: string
  tipo: string
}
