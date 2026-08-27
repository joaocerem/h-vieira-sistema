/**
 * Espelha `EmpresaResponse` (backend, `interfaces/http/empresa/EmpresaResponse.java`).
 * Ver `docs/domain-model/01-empresa.md` — cadastro simples, sem regra de negócio própria além
 * da obrigatoriedade de `nome`.
 */
export interface Empresa {
  id: string
  nome: string
}

/** Espelha `EmpresaRequest` (backend) — usado tanto para criação quanto para atualização. */
export interface EmpresaFormValues {
  nome: string
}
