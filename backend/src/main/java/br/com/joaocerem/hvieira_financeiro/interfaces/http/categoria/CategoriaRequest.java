package br.com.joaocerem.hvieira_financeiro.interfaces.http.categoria;

import jakarta.validation.constraints.NotBlank;

public record CategoriaRequest(
        @NotBlank(message = "nome é obrigatório") String nome,
        @NotBlank(message = "tipo é obrigatório") String tipo
) {
}
