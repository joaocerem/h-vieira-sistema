/**
 * Espelha `UsuarioResponse` (backend). "Usuário mínimo" (`docs/domain-model/02-usuario.md`) —
 * deliberadamente sem senha, papel ou escopo de Empresa (S1/S2, `pendencias.md`, Seção 7).
 */
export interface Usuario {
  id: string
  nome: string
  identificadorDeAcesso: string
  situacaoDeAcesso: string | null
}

/** `identificadorDeAcesso` só existe na criação — imutável depois (mesma regra de `ContaBancaria`/`CartaoCredito`). */
export interface UsuarioCriarValues {
  nome: string
  identificadorDeAcesso: string
  situacaoDeAcesso: string
}

export interface UsuarioAtualizarValues {
  nome: string
  situacaoDeAcesso: string
}
