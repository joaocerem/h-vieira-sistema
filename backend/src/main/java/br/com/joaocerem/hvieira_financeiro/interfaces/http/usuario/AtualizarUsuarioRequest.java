package br.com.joaocerem.hvieira_financeiro.interfaces.http.usuario;

import jakarta.validation.constraints.NotBlank;

/**
 * Sem `identificadorDeAcesso` — ver justificativa em {@link br.com.joaocerem.hvieira_financeiro.application.usuario.UsuarioService}.
 */
public record AtualizarUsuarioRequest(
        @NotBlank(message = "nome é obrigatório") String nome,
        String situacaoDeAcesso
) {
}
