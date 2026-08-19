package br.com.joaocerem.hvieira_financeiro.interfaces.http.usuario;

import jakarta.validation.constraints.NotBlank;

public record CriarUsuarioRequest(
        @NotBlank(message = "nome é obrigatório") String nome,
        @NotBlank(message = "identificadorDeAcesso é obrigatório") String identificadorDeAcesso,
        String situacaoDeAcesso
) {
}
